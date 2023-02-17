// configuration mySql server
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    database: 'sql12598580',
    user: 'sql12598580',
    password: '3KAkEWftZ8',
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Connected!');
}
);



const qrcode = require('qrcode-terminal');
const { Client, NoAuth, AuthStrategy } = require('whatsapp-web.js');
const client = new Client(
    { puppeteer: {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']}, session: "sessionCfg"}
);

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

//authentification and authorization for user

function schedule(){
    client.on('message', async message => {
        const contact = (await message.getContact()).number;
        console.log(contact);
        const hour = new Date().getHours();
        if(message.body.includes('!setJadwal')){
            let text = message.body.split('!setJadwal')[1];
            let textSplit = text.split(',');
            // data.push(text);
            // change data from array to database
            // insert data to database table jadwal with column name, jam, nama_kegiatan
            
            await connection.query(`INSERT INTO jadwal (hari, jam, nama_kegiatan, number_user) VALUES ('${textSplit[0]}','${textSplit[1]}','${textSplit[2]}', '${contact}')`, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                message.reply('jadwal berhasil ditambahkan');
            });
        }else if(message.body.includes('!getAllJadwal')){
            // data.forEach(element => {
            //     client.sendMessage(message.from,element);
            // });
            // get data from database
            connection.query(`SELECT * FROM jadwal WHERE number_user LIKE '%${contact}%'`, function (err, result, fields) {
                if (err) throw err;
                if(result[0] == undefined){
                    client.sendMessage(message.from, 'Jadwal kamu hari ini kosong');
                }else{
                client.sendMessage(message.from, 'Jadwal keseluruhan jadwal kamu');
                result.forEach(element => {
                    client.sendMessage(message.from,element.hari + ', ' + element.jam + ', ' + element.nama_kegiatan);
                });
            }
            });
        }else if(message.body.includes('!help')){
            message.reply('Ketik [!setJadwal hari,08:00,nama kegiatan] untuk menambahkan jadwal baru \n Ketik !getAllJadwal untuk melihat jadwal kamu hari ini \n Ketik !getJadwalToday untuk melihat jadwal kamu hari ini');
        }// jadwal hari ini
        else if(message.body.includes('!getJadwalToday')){
            let today = new Date();
            let day = today.getDay();
            let daylist = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
            let dayNow = daylist[day].toLowerCase();
            console.log(dayNow);


            // get data from database
            connection.query(`SELECT * FROM jadwal WHERE hari LIKE '%${dayNow}%' && number_user LIKE '%${contact}%'`, function (err, result, fields) {
                if (err) throw err;
                if(result[0] == undefined){
                    client.sendMessage(message.from, 'Jadwal kamu hari ini kosong');
                }else{
                    client.sendMessage(message.from, 'Jadwal kamu hari ini');
                    result.forEach(element => {
                        client.sendMessage(message.from, element.hari + ', ' + element.jam + ', ' + element.nama_kegiatan);
                    });
                }
        });
        }else if(message.body.includes('!deleteJadwal')){
       
            let text = message.body.split('!deleteJadwal')[1];
            connection.query(`DELETE FROM jadwal WHERE hari LIKE '%${text}%' && number_user LIKE '%${contact}%'`, function (err, result) {
                if (err){
                    message.reply('jadwal tidak ditemukan');
                    throw err;
                }
                console.log("1 record deleted");
                message.reply('jadwal berhasil dihapus');
            });
        }
        // }else if(message.body.includes('!ask') && contact.includes('6287836672971')){
        //     let text = message.body.split('!ask')[1];
        //     let prompt = 'Q: '+text+'\nA:';
        //         const completion = await openai.createCompletion({
        //           model: "text-davinci-003",
        //           prompt: prompt,
        //           temperature: 0,
        //           max_tokens: 300,
        //           top_p: 1.0,
        //           frequency_penalty: 0.0,
        //           presence_penalty: 0.0,
        //         });
        //         client.sendMessage(message.from, completion.data.choices[0].text);
        // }
})
}
schedule();

