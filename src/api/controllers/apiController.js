'use strict';

var Factory = require('../models/factory');
var formidable = require('formidable');
var kdbxweb = require('kdbxweb');
var config = require('config');
var fs = require('fs');
var path = require('path');

let registerUrls = {
    "999Dice":"https://www.999doge.com/?224280708",
    "BetKing":"https://betking.io/?ref=u:mydicebot",
    "BitDice":"https://www.bitdice.me/?r=90479",
    "Bitsler":"https://www.bitsler.com/?ref=mydicebot",
    "BitVest":"https://bitvest.io?r=108792",
    "Crypto-Games":"https://www.crypto-games.net?i=CpQP3V8Up2",
    "Dice-Bet":"https://dice-bet.com/?ref=u:mydicebot",
    "DuckDice":"https://duckdice.com/ab61534783",
    "Freebitco.in":"https://freebitco.in/?r=16392656",
    "KingDice":"https://kingdice.com/#/welcome?aff=18072",
    "MegaDice":"https://www.megadice.com/?a=326492144",
    "NitroDice":"https://www.nitrodice.com?ref=0N2pG8rkL7UR6oMzZWEj",
    "NitrogenSports":"https://nitrogensports.eu/r/4998127",
    "PrimeDice":"https://primedice.com/?c=mydicebot",
    "SafeDice":"https://safedice.com/?r=100309",
    "Stake":"https://stake.com/?code=mydicebot",
    "YoloDice":"https://yolodice.com/r?6fAf-wVz",
    "EpicDice": "https://magic-dice.com/?ref=mydicebot",
    "SteemBet": "https://magic-dice.com/?ref=mydicebot",
    "KryptoGames": "https://magic-dice.com/?ref=mydicebot",
    "WinDice": "https://windice.io/?r=e63q8xq4y",
};

let mydiceUrls = {
    "GitHub":"https://github.com/mydicebot/mydicebot.github.io/releases",
    "Discord":"https://discord.gg/S6W5ec9",
    "Home":"https://mydicebot.com",
    "Sim":"https://simulator.mydicebot.com",
}

exports.index = function(req, res) {
    res.render('index', { title: 'My Dice Bot',skin:req.session.skin });
};

exports.login = async function(req, res) {
    try{
        if(typeof req.body.username !== 'undefined'){
            let dice = Factory.create(req.body.site);
            let ret = await dice.login(req.body.username, req.body.password, req.body.twofa, req.body.apikey, req);
            if(ret != true){
                res.render('login', {title: 'My Dice Bot',message:ret,site:req.params.site,skin:req.session.skin});
            } else {
                res.redirect(req.protocol+"://"+req.headers.host+"/"+req.body.site+"/info");
            }
        } else {
            res.render('login',{title: 'My Dice Bot',site:req.params.site,skin:req.session.skin});
        }
    } catch(err) {
        console.log(err);
        res.render('login', {title: 'My Dice Bot',message:err.toString(),site:req.params.site,skin:req.session.skin});
    }
};

exports.info = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let retUser = await dice.getUserInfo(req);
        let ret = {};
        ret.site = '../js/'+req.params.site+'/info.js';
        ret.skin = req.session.skin;
        ret.codeSkin = 'default';
        ret.title = 'My Dice Bot';
        ret.url = config.mydice.url;
        if(req.session.skin == 'Contrast') {
            ret.codeSkin = 'night';
        }
        res.render('info', ret);
    } catch(err) {
        console.log(err);
        //res.render('error',{err: err.toString()});
        res.render('login', {message:err.toString(),site:req.params.site,skin:req.session.skin});
    }
};

exports.bet = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.bet(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        return res.status(200).json({err: err.toString()});
    }
};

exports.resetseed = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.resetseed(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        return res.status(500).json({err: err.toString()});
    }
};

exports.refresh = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.refresh(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        return res.status(500).json({err: err.toString()});
    }
};

exports.clear = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.clear(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        return res.status(500).json({err: err.toString()});
    }
};

exports.keecheck = async function(req, res) {
    try{
        let keepassfile = req.query.keepassfile;
        let filePath = path.resolve(path.join(process.execPath, '../keepass/')+keepassfile+'.kdbx');
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/keepass/'+keepassfile+'.kdbx');
            filePath = path.resolve(path.join(__dirname, '../../keepass/'+keepassfile+'.kdbx'));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/keepass/'+keepassfile+'.kdbx'));
        }
        if (fs.existsSync(filePath)) {
            return res.status(200).json(true);
        } else {
            return res.status(200).json(false);
        }
    } catch(err) {
        console.log(err);
        return res.status(500).json({err: err.toString()});
    }
};

exports.keeload = async function(req, res) {
    try{
        let filePath = path.resolve(path.join(process.execPath, '../keepass/')+req.body.keepassfile+'.kdbx');
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/keepass/'+req.body.keepassfile+'.kdbx');
            filePath = path.resolve(path.join(__dirname, '../../keepass/'+req.body.keepassfile+'.kdbx'));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/keepass/'+req.body.keepassfile+'.kdbx'));
        }
        let cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(req.body.keepassword));
        let data  = await fs.readFileSync(filePath);
        let db = await kdbxweb.Kdbx.load(new Uint8Array(data).buffer, cred);
        let kees = {};
        for (let group of db.groups) {
            if(group.name == 'mydicebot') {
                for (let subGroup of group.groups) {
                    let entrys = [];
                    for (let entry of subGroup.entries) {
                        let en = {};
                        en['username'] = field(entry, 'UserName');
                        en['password'] = field(entry, 'Password');
                        en['apikey'] = field(entry, 'ApiKey');
                        entrys.push(en);
                    }
                    kees[subGroup.name] = entrys;
                }
            }
        }
        return res.status(200).send(kees);
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.keereg = async function(req, res) {
    try{
        let filePath = path.resolve(path.join(process.execPath, '../keepass/')+req.body.keepassfile+'.kdbx');
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/keepass/'+req.body.keepassfile+'.kdbx');
            filePath = path.resolve(path.join(__dirname, '../../keepass/'+req.body.keepassfile+'.kdbx'));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/keepass/'+req.body.keepassfile+'.kdbx'));
        }
        let cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(req.body.keepassword));
        let db = kdbxweb.Kdbx.create(cred, 'mydicebot');
        //let subGroup = db.createGroup(db.getDefaultGroup(), 'mydicebot');
        db.save().then(ab => {
            fs.writeFileSync(filePath, Buffer.from(ab));
            return res.status(200).json('ok');
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.keesave = async function(req, res) {
    try{
        let filePath = path.resolve(path.join(process.execPath, '../keepass/')+req.query.keepassfile+'.kdbx');
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/keepass/'+req.body.keepassfile+'.kdbx');
            filePath = path.resolve(path.join(__dirname, '../../keepass/'+req.query.keepassfile+'.kdbx'));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/keepass/'+req.query.keepassfile+'.kdbx'));
        }
        let cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(req.query.keepassword));
        let db = kdbxweb.Kdbx.create(cred, 'mydicebot');
        for(let k1  in req.body) {
            let subGroup = db.createGroup(db.getDefaultGroup(), k1);
            if(typeof req.body[k1] == 'string') {
                req.body[k1] = JSON.parse(req.body[k1]);
            }
            for(let k2  in req.body[k1]) {
                let entry = db.createEntry(subGroup);
                db.meta.customData.key = 'MyDiceBot#' + k2;
                entry.fields.Title = 'MyDiceBot_'+k1+'_' + k2;
                entry.fields.UserName = (req.body[k1][k2].username =='') ? req.body[k1][k2].apikey : req.body[k1][k2].username;
                entry.fields.Password = req.body[k1][k2].password;
                entry.fields.ApiKey = req.body[k1][k2].apikey;
                entry.fields.URL = registerUrls[k1];
                entry.fields.GitHubUrl = mydiceUrls['GitHub'];
                entry.fields.DiscordUrl = mydiceUrls['Discord'];
                entry.fields.OfficialSiteUrl = mydiceUrls['Home'];
                entry.fields.OnlineSimulatorUrl = mydiceUrls['Sim'];
                entry.times.update();
            }
        }
        db.save().then(ab => {
            fs.writeFileSync(filePath, Buffer.from(ab));
            return res.status(200).json('ok');
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.keefiles = async function(req, res) {
    try{
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/'));
        let filePath = path.resolve(path.join(process.execPath, '../keepass/'));
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/keepass/');
            filePath = path.resolve(path.join(__dirname, '../../keepass/'));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/keepass/'));
        }
        let paths = await getFiles(filePath, 'kdbx');
        return res.status(200).json(paths);
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.save = async function(req, res) {
    try{
        let content = req.body.scriptStr;
        let fileName = req.body.fileName;
        let index= fileName.lastIndexOf(".");
        let ext = fileName.substr(index+1);
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+fileName);
        let filePath = path.resolve(path.join(process.execPath, '../script/'+ext+'/')+fileName);
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/script/lua/'+fileName);
            filePath = path.resolve(path.join(__dirname, '../../script/'+ext+'/'+fileName));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/script/'+ext+'/'+fileName));
        }
        let str  = await writeFile(filePath, content);
        return res.status(200).json(str);
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.file = async function(req, res) {
    try{
        let index= req.query.file.lastIndexOf(".");
        let ext = req.query.file.substr(index+1);
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+req.query.file);
        let filePath = path.resolve(path.join(process.execPath, '../script/'+ext+'/')+req.query.file);
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/script/lua/'+req.query.file);
            filePath = path.resolve(path.join(__dirname, '../../script/'+ext+'/'+req.query.file));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/script/'+ext+'/'+req.query.file));
        }
        let content  = await readFile(filePath);
        return res.status(200).json(content);
    } catch(err) {
        console.log(err);
        return res.status(500).json({err: err.toString()});
    }
};

exports.script = async function(req, res) {
    try{
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/'));
        let ext = req.query.ext;
        let filePath = path.resolve(path.join(process.execPath, '../script/'+ext+'/'));
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/script/lua/');
            filePath = path.resolve(path.join(__dirname, '../../script/'+ext+'/'));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/script/'+ext+'/'));
        }
        let paths = await getFiles(filePath, ext);
        return res.status(200).json(paths);
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.del = async function(req, res) {
    try{
        let index= req.query.file.lastIndexOf(".");
        let ext = req.query.file.substr(index+1);
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+req.query.file);
        let filePath = path.resolve(path.join(process.execPath, '../script/'+ext+'/')+req.query.file);
        if(isMobile(req)) {
            //filePath = path.resolve('/tmp/script/lua/'+req.query.file);
            filePath = path.resolve(path.join(__dirname, '../../script/'+ext+'/'+req.query.file));
        }
        if(process.env.electron) {
            filePath = path.resolve(path.join(config.mydice.path, '/script/'+ext+'/'+req.query.file));
        }
        fs.unlinkSync(filePath);
        return res.status(200).json('ok');
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.sound = async function(req, res) {
  try{
    let filePath = path.resolve(path.join(process.execPath, '../sound/')+req.query.file);
    if(isMobile(req)) {
      filePath = path.resolve(path.join(__dirname, '../../sound/'+req.query.file));
    }
    if(process.env.electron) {
      filePath = path.resolve(path.join(config.mydice.path, '/sound/'+req.query.file));
    }
    if(!fs.existsSync(filePath)){
      return res.status(500).send({err: 'Music file does not exist'});
    }
    res.setHeader("content-type", "audio/mpeg");
    let readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    //fs.createReadStream(filePath).pipe(res);
  } catch(err) {
    console.log(err);
    return res.status(500).send({err: err.toString()});
  }
}
exports.upload = async function(req, res) {
    try{
        let form = new formidable.IncomingForm();
        form.parse(req, function(error, fields, files) {
            let index= files.upload.name.lastIndexOf(".");
            let ext = files.upload.name.substr(index+1);
            //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+files.upload.name);
            let filePath = path.resolve(path.join(process.execPath, '../script/'+ext+'/')+files.upload.name);
            if(isMobile(req)) {
                //filePath = path.resolve('/tmp/script/lua/'+files.upload.name);
                filePath = path.resolve(path.join(__dirname, '../../script/'+ext+'/'+files.upload.name));
            }
            if(process.env.electron) {
                filePath = path.resolve(path.join(config.mydice.path, '/script/'+ext+'/'+files.upload.name));
            }
            fs.writeFileSync(filePath, fs.readFileSync(files.upload.path));
            return res.status(200).json('ok');
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.toString()});
    }
};

exports.checkerr = async function(req, res) {
    let mess = req.query.mess;
    let errCount = req.query.count;
    if(mess != '' && typeof mess !== 'undefined') {
        //console.error(mess);
        //webix.message({type: 'error', text: mess });
        if (errCount>2) {
            errCount = 1;
            return res.status(200).json({'ret':false,'count':errCount});
        } else {
            await sleep(5000);
            errCount++;
            return res.status(200).json({'ret':true,'count':errCount});
        }
    } else {
        errCount = 1;
        return res.status(200).json({'ret':true,'count':errCount});
    }
};

async function getFiles(filePath,ext){
    let paths = [];
    return new Promise(( resolve, reject ) => {
        fs.readdir(filePath,function(err,files){
            if(err) {
                reject( err );
                return;
            }
            if(typeof files !== 'undefined') {
                files.forEach(function(filename){
                    if(path.extname(filename).toLowerCase() == '.'+ext) {
                        paths.push(filename);
                    }
                });
                resolve(paths);
            } else {
                resolve('');
            }
        });
    });
}

async function readFile(filePath){
    let buf = new Buffer.alloc(1024*10);
    return new Promise(( resolve, reject ) => {
        fs.open(filePath, 'r+', function(err, fd) {
            if (err) {
                reject( err );
                return;
            }
            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                if (err){
                    reject( err );
                    return;
                }
                if(bytes > 0){
                    resolve(buf.slice(0, bytes).toString());
                }
            });
        });
    });
}

async function writeFile(filePath, content){
    return new Promise(( resolve, reject ) => {
        fs.writeFile(filePath, content, function(err) {
            if(err) {
                reject( err );
                return;
            }
            resolve("ok");
        });
    });
}

function field(entry, name) {
    let field = entry.fields[name];
    if (field && field.getText) {
        return field.getText();
    }
    return field;
}

function isMobile(req) {
    let deviceAgent = req.headers["user-agent"].toLowerCase();
    let agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if(agentID){
        return true;
    }else{
        return false;
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


