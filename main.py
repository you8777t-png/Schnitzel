import discord
from discord.ext import commands
import firebase_admin
from firebase_admin import credentials, firestore

# Conecta o Bot na sua nuvem do Firebase usando o arquivo baixado
cred = credentials.Certificate("chave.json") 
firebase_admin.initialize_app(cred)
db = firestore.client()

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="ec.", intents=intents)

@bot.event
async def on_ready():
    print(f'🤖 {bot.user} conectado aos satélites do Banco Central!')
    print('Sistema de Diárias Online!')

@bot.command()
async def diario(ctx):
    nome_jogador = ctx.author.name 
    
    doc_ref = db.collection("contas_globais").document(nome_jogador)
    doc = doc_ref.get()

    if doc.exists():
        # Aumenta 5000 S$ direto na nuvem!
        doc_ref.update({
            "banco": firestore.Increment(5000)
        })
        await ctx.send(f"🎉 Sucesso, **{nome_jogador}**! S$ 5.000 foram depositados no teu Banco Central Schnitzel. Confere o site!")
    else:
        await ctx.send(f"❌ Não encontrei a tua conta, **{nome_jogador}**. Cria um perfil no site primeiro usando o teu nome exato do Discord!")

# Substitua pelo Token do seu bot do Discord Developer Portal
bot.run('COLE_SEU_TOKEN_AQUI')