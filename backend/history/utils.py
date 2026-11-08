"""Helpers that store a visitor's history in their session. Owner: Deep"""

MAX_ITEMS = 10  # keep only the 10 most recent of each


def remember_search(request, keyword, category):
    searches = request.session.get("searches", [])
    entry = {"q": keyword, "category": category}
    if entry in searches:
        searches.remove(entry)  # move a repeated search to the top
    searches.insert(0, entry)
    request.session["searches"] = searches[:MAX_ITEMS]


def remember_viewed_provider(request, provider_id):
    viewed = request.session.get("viewed_providers", [])
    if provider_id in viewed:
        viewed.remove(provider_id)
    viewed.insert(0, provider_id)
    request.session["viewed_providers"] = viewed[:MAX_ITEMS]