from datetime import date

COOKIE_NAME = "visits_today"
SKIP_PREFIXES = ("/api/", "/static/", "/media/", "/admin/", "/favicon")


class VisitTrackingMiddleware:
    """Counts how many times the user opened the site today.

    The count is kept in a cookie like "2026-11-08|3" and copied into the
    session so the history API can read it. It resets on a new day.
    Owner: Deep
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        today = date.today().isoformat()
        day, _, count = request.COOKIES.get(COOKIE_NAME, "").partition("|")
        count = int(count) if day == today and count.isdigit() else 0

        # Only a real page load counts as a visit, not API calls or images.
                # The React app calls /api/history/visit/ once each time the site is opened.
        is_visit = request.path == "/api/history/visit/" or (
            request.method == "GET" and not request.path.startswith(SKIP_PREFIXES)
        )
        if is_visit:
            count += 1
        # Only save when the count changed. Writing the session on every API
        # call would mean a database write for every single request.
        visits = {"date": today, "count": count}
        if request.session.get("visits_today") != visits:
            request.session["visits_today"] = visits

        response = self.get_response(request)

        if is_visit:
            response.set_cookie(COOKIE_NAME, f"{today}|{count}", max_age=60 * 60 * 24, samesite="Lax")
        return response