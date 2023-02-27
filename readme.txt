ChatApp

Kör npm install i API, client och socket.

Kör npm start i Api sen socket sen client.

I API ska ".env" finnas med mongo url:
MONGO_URL=mongodb+srv://chatapp:chatapp@chatapp.cihbhs1.mongodb.net/?retryWrites=true&w=majority
eller till en egen mongo server.

För att skapa en användare måste lösenordet innehålla minst 8 tecken varav minst en 
stor bokstav, liten bokstav, siffra och specialtecken.

För att skapa en admin använder man en POST i postman på url:
http://localhost:8800/api/admin/create
och i body skriver man:
{
    "email": "admin@admin.com",
    "password": "Admin1234!"
}




