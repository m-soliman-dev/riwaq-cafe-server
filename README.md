# RIWAQ CAFÉ (server version)
Same site as riwaq-cafe-demo, but orders, bookings, event requests and messages are stored in a Supabase (Postgres) database, and the admin signs in with a real account.
- Customer: root page. Admin: `#/admin` (email + password of the shop admin account).
- Tables: riwaq_state (menu, content, settings), riwaq_submissions (orders, bookings, requests, messages) with row level security: the public can only add submissions and look up one order by its code; only the admin account can read, edit and delete.
- Backend project: the same free Supabase project as Bistro 27 (separate riwaq_* tables).
