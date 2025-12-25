# tests/test_chatbot_controller.py
def test_chatbot_page(client):
    response = client.get("/chatbot-page")
    assert response.status_code == 200
    assert b"Chatbot" in response.data  # Assuming your template has the word 'Chatbot'