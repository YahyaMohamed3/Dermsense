from google import genai

client = genai.Client(api_key="AIzaSyCv5xRq0RrBd_Jc3KdmW-vXNdJtxkI8gTk")

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Explain how AI works in a few words"
)
print(response.text)