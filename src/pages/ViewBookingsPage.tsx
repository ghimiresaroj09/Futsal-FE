import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  CalendarPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  EyeIcon,
  LoaderCircleIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { BookingDetailsDialog } from "@/components/bookings/BookingDetailsDialog";
import { UpdateBookingDialog } from "@/components/bookings/UpdateBookingDialog";
import { BookingStatusBadge } from "@/components/bookings/status-badges";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  cancelBooking,
  fetchAllBookings,
  fetchBookingById,
} from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/error";
import { formatDate, formatTime12h } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import type { Booking, BookingStatus } from "@/types/booking";

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "RESCHEDULED",
];
const PAGE_SIZES = [5, 10, 20, 50] as const;

/**
 * View Bookings — the bookings table (S.N., Reference, Date, Time, Amount,
 * Status, Actions) with search/date/status filters and pagination, fed by
 * GET /api/v1/bookings/. Non-admin users see their own bookings only.
 */
export function ViewBookingsPage() {
  useDocumentTitle("View Bookings");
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL",
  );
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);

  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [detailsRefreshing, setDetailsRefreshing] = useState(false);
  const [updateBooking, setUpdateBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Live bookings from the backend. Admins see everything the API returns;
  // everyone else sees only their own (matched by email).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetchAllBookings()
      .then((all) => {
        if (cancelled) return;
        const mine =
          user?.role === "ADMIN" || !user?.email
            ? all
            : all.filter(
                (booking) =>
                  booking.email.toLowerCase() === user.email!.toLowerCase(),
              );
        setBookings(mine);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load your bookings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role, user?.email, reloadKey]);

  /**
   * Open the details dialog — instantly from the row's data, then swap in
   * the freshest record from GET /api/v1/bookings/:id/.
   */
  const handleView = (booking: Booking) => {
    setDetailsBooking(booking);
    setDetailsRefreshing(true);
    fetchBookingById(booking.id)
      .then((fresh) => setDetailsBooking(fresh))
      .catch(() => {
        // The row's data is already on screen — keep it if the refresh
        // fails (e.g. the backend is waking up).
      })
      .finally(() => setDetailsRefreshing(false));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (q) {
        const haystack =
          `${booking.booking_reference} ${booking.full_name} ${booking.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (dateFilter && booking.slot.date !== dateFilter) return false;
      if (statusFilter !== "ALL" && booking.status !== statusFilter)
        return false;
      return true;
    });
  }, [bookings, query, dateFilter, statusFilter]);

  // Guard: bookings are personal — sign in first. Keep this below all hooks
  // so every render invokes hooks in the same order.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  /** Reset to the first page whenever a filter changes. */
  const applyFilter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const handleUpdateSave = (_booking: Booking, updated: Booking) => {
    // PATCH /api/v1/bookings/:id/ succeeded — swap in the fresh record.
    setBookings((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setUpdateBooking(null);
    toast.success("Booking updated", {
      description: updated.booking_reference,
    });
  };

  /** Open the cancel dialog with a fresh slate. */
  const openCancelDialog = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelReason("");
    setCancelError(null);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const reason = cancelReason.trim();
    if (reason.length < 3) {
      setCancelError("Please tell us why (at least 3 characters).");
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      // POST /api/v1/bookings/:id/cancel/ — response is the full updated
      // booking; swap it into the row so status/refund info are exact.
      const cancelled = await cancelBooking(cancelTarget.id, reason);
      setBookings((prev) =>
        prev.map((item) => (item.id === cancelled.id ? cancelled : item)),
      );
      toast.success("Booking cancelled", {
        description: cancelled.booking_reference,
      });
      setCancelTarget(null);
    } catch (error) {
      if (error instanceof ApiError) {
        setCancelError(error.message);
      } else {
        setCancelError("Something went wrong. Please try again.");
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            My bookings
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            View Bookings
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every slot you've booked, in one place — check references, follow
            payment status and manage upcoming matches.
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link to="/bookings">
            <CalendarPlusIcon aria-hidden="true" />
            Book a Slot
          </Link>
        </Button>
      </div>

      <Card className="mt-8 gap-0 overflow-hidden rounded-2xl p-0">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput
            className="sm:max-w-xs"
            value={query}
            onChange={applyFilter(setQuery)}
            placeholder="Search reference, name or email…"
            aria-label="Search bookings"
          />
          <input
            type="date"
            aria-label="Filter by date"
            value={dateFilter}
            onChange={(e) => applyFilter(setDateFilter)(e.target.value)}
            className="border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 outline-none focus-visible:ring-2 sm:w-auto"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              applyFilter(setStatusFilter)(value as BookingStatus | "ALL")
            }
          >
            <SelectTrigger
              className="w-full sm:w-40"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">
                All statuses
              </SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="cursor-pointer"
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <LoaderCircleIcon
              className="text-muted-foreground size-7 animate-spin"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-sm">
              Loading your bookings…
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <CircleAlertIcon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600">{loadError}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                The bookings service didn't respond — maybe it's waking up.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Retry
            </Button>
          </div>
        ) : pageItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="h-10 pl-4 text-left">S.N.</TableHead>
                <TableHead className="h-10 text-left">Reference</TableHead>
                <TableHead className="h-10 text-left">Date</TableHead>
                <TableHead className="h-10 text-left">Time</TableHead>
                <TableHead className="h-10 text-left">Amount</TableHead>
                <TableHead className="h-10 text-left">Status</TableHead>
                <TableHead className="h-10 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((booking, index) => (
                <TableRow key={booking.id} className="cursor-default">
                  <TableCell className="pl-4 tabular-nums">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {booking.booking_reference}
                  </TableCell>
                  <TableCell>{formatDate(booking.slot.date)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatTime12h(booking.slot.start_time)} –{" "}
                    {formatTime12h(booking.slot.end_time)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    Rs {Number(booking.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 cursor-pointer"
                        aria-label={`View details of ${booking.booking_reference}`}
                        title="View details"
                        onClick={() => handleView(booking)}
                      >
                        <EyeIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 cursor-pointer"
                        aria-label={`Update ${booking.booking_reference}`}
                        title={
                          booking.status === "PENDING"
                            ? "Update"
                            : "Only pending bookings can be updated"
                        }
                        disabled={booking.status !== "PENDING"}
                        onClick={() => setUpdateBooking(booking)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive size-7 cursor-pointer"
                        aria-label={`Cancel ${booking.booking_reference}`}
                        title="Cancel booking"
                        disabled={
                          booking.status === "CANCELLED" ||
                          booking.status === "COMPLETED"
                        }
                        onClick={() => openCancelDialog(booking)}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-10">
            <EmptyState
              title="No bookings found"
              description="Try changing the filters, or book your first slot."
              action={
                <Button asChild variant="outline" className="cursor-pointer">
                  <Link to="/bookings">Book a Slot</Link>
                </Button>
              }
            />
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
            {/* Rows per page — left */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) =>
                  applyFilter(setPageSize)(Number(value))
                }
              >
                <SelectTrigger className="w-18" aria-label="Rows per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="cursor-pointer"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Range + page nav — right */}
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground text-xs tabular-nums">
                {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 cursor-pointer"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon />
                </Button>
                <span className="text-muted-foreground px-1 text-xs tabular-nums">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 cursor-pointer"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Dialogs */}
      <BookingDetailsDialog
        booking={detailsBooking}
        refreshing={detailsRefreshing}
        onClose={() => setDetailsBooking(null)}
      />
      {updateBooking ? (
        <UpdateBookingDialog
          key={updateBooking.id}
          booking={updateBooking}
          onClose={() => setUpdateBooking(null)}
          onSave={handleUpdateSave}
        />
      ) : null}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => (!open ? setCancelTarget(null) : undefined)}
        title="Cancel this booking?"
        description={
          cancelTarget
            ? `${cancelTarget.booking_reference} on ${formatDate(cancelTarget.slot.date)}, ${formatTime12h(cancelTarget.slot.start_time)} – ${formatTime12h(cancelTarget.slot.end_time)} will be cancelled. The slot is released for other players.`
            : undefined
        }
        confirmText="Yes, cancel booking"
        variant="destructive"
        loading={cancelling}
        onConfirm={handleCancelConfirm}
      >
        <div className="space-y-2">
          <label htmlFor="cancel-reason" className="text-sm font-medium">
            Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(e) => {
              setCancelReason(e.target.value);
              setCancelError(null);
            }}
            placeholder="e.g. Not enough players showed up"
            rows={2}
            maxLength={200}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
          />
          {cancelError ? (
            <p className="text-destructive text-xs">{cancelError}</p>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  );
}
