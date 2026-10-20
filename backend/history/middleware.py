class VisitTrackingMiddleware:
    """Tracks visits per day using cookies and sessions.

    Owner: Yashkumar
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # TODO: count today's visits in request.session / a cookie.
        response = self.get_response(request)
        return response
