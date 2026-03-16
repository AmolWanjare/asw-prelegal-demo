def test_get_catalog_returns_all_types(client):
    resp = client.get("/api/catalog")
    assert resp.status_code == 200
    data = resp.json()
    # 11 unique slugs (mutual_nda_cover_page is an alias)
    assert len(data["items"]) == 11
    slugs = [i["slug"] for i in data["items"]]
    assert "mutual_nda" in slugs
    assert "cloud_service_agreement" in slugs
    assert "business_associate_agreement" in slugs
    assert "ai_addendum" in slugs


def test_catalog_no_auth_required(client):
    """Catalog endpoint should not require authentication."""
    resp = client.get("/api/catalog")
    assert resp.status_code == 200


def test_catalog_items_have_required_fields(client):
    resp = client.get("/api/catalog")
    data = resp.json()
    for item in data["items"]:
        assert "slug" in item
        assert "display_name" in item
        assert "description" in item
        assert "filename" in item
        assert len(item["display_name"]) > 0
