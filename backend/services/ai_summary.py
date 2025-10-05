import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def summarize_weather(stats_json, date_iso: str):
    """
    Gera um resumo textual geral das condições climáticas com base nas médias e probabilidades
    do histórico, incluindo a data/hora para contextualizar o período do dia.
    """
    prompt = f"""
    Gere um resumo breve (2 a 3 frases) com linguagem leve e humana,
    descrevendo as condições climáticas gerais com base nas médias e probabilidades abaixo.

    Considere também a data e o horário: {date_iso}.
    O texto deve soar como uma previsão cotidiana (ex: "nesta manhã", "à tarde", "à noite"),
    sem mencionar coordenadas geográficas nem termos técnicos.

    Unidades das variáveis:
    - temperatura_ar: °C
    - precipitacao e neve: mm/h
    - vento: m/s
    - radiacao_solar: W/m²
    - umidade_do_ar: g/kg
    - umidade_do_solo: kg/m²

    Dados:
    {stats_json['estatisticas']}

    Instruções:
    - Fale de forma natural e positiva, como um boletim informal.
    - Resuma temperatura, chuva, vento e umidade de modo compreensível.
    - Se a chance de chuva for baixa, diga que o tempo está bom para atividades ao ar livre.
    - Se for alta, comente sobre possibilidade de chuva e clima úmido.
    - Adapte o tom ao horário do dia (ex: manhã, tarde, noite).
    - Use tom acolhedor, fluido e humano.
    """

    response = model.generate_content(prompt)
    return response.text.strip()
