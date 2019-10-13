"use strict";

// Copyright (c) 2017 hirowaki https://github.com/hirowaki

const LeaderboardService = require('./service');

function censor(censor) {
    var i = 0;
  
    return function(key, value) {
      if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
        return '[Circular]'; 
  
      if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
        return '[Unknown]';
  
      ++i; // so we know we aren't using the original object anymore
  
      return value;  
    }
  }

class LeaderboardController {
    static register(app) {
        app.get('/', this.list);
        app.post("/clear", this.clear);
        app.post("/insert", this.insert);
        app.post("/insertRandomPlayer", this.insertRandomPlayer);
        app.post("/insertJson", this.insertJson);
        app.post("/modify", this.modify);
        app.post("/remove", this.remove);
    }

    static list(req, res) {
        const page = +req.query.page || 1;

        return LeaderboardService.getList(page)
        .then((list) => {
            res.render('index.ejs', {
                page: list.page,
                maxPage: list.maxPage,
                total: list.total,
                list: list.list
            });
        });
    }

    static clear(req, res) {
        void(req);
        void(res);
        return;
        /*return LeaderboardService.clear()
        .then(() => {
            res.json({});
        });*/
    }

    static insert(req, res) {
        const name = req.body.name || "";
        const score = +req.body.score || 1;
        
            // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
        if(username != "grt" || password != "duh")
                    return res.status(401).json({ message: 'unauthorized' });


        return LeaderboardService.insert(name, score)
        .then(() => {
            res.json({});
        });
    }

    static insertRandomPlayer(req, res) {
        void(req);
        void(res);
        console.log("inserting random players is disabled");
        return;
        /*const num = +req.body.num || 1;

        return LeaderboardService.insertRandom(num)
        .then(() => {
            res.json({});
        });*/
    }

    static insertJson(req, res) {
        const name = req.body.name || "";
        const json = JSON.stringify(req.body, censor(req.body));
        //console.log(json);
        return LeaderboardService.insertJson(name, json)
        .then(() => {
            res.json({});
        });
    }

    static remove(req, res) {
        const name = req.body.name || "";

        return LeaderboardService.remove(name)
        .then(() => {
            res.json({});
        })
        .catch(() => {
            res.status(400).send('maybe wrong request.');
        });
    }

    static modify(req, res) {
        void(req);
        void(res);
        console.log("modifying players' stats is disabled");
        return;
        /*const name = req.body.name || "";
        const delta = +req.body.delta || 1;

        return LeaderboardService.modifyScore(name, delta)
        .then(() => {
            res.json({});
        })
        .catch(() => {
            res.status(400).send('maybe wrong request.');
        });*/
    }
}

module.exports = LeaderboardController;
