# Frontend Structure (Eventura)

Pages:
- Login, Signup, Home, MovieDetails (seat selection), BookingConfirmation, Profile

Components:
- Navbar, MovieCard, SeatSelector, PaymentModal, NotificationBanner

State:
- Redux Toolkit: authSlice, moviesSlice, bookingSlice

Integration points:
- /api/auth/login
- /api/movies
- /api/show/:id/seats (for real-time seat layout and locking)
- /api/booking (create / confirm)
