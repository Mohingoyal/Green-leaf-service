var express = require("express");
var app = express();
let fileuploader = require("express-fileupload")//necessary to use for post
app.use(fileuploader());
//========================
require('dotenv').config();//for nodemailer it is necessary
// const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com', // Replace with your email provider's SMTP host
//   port: 465,               // Use 465 for SSL or 587 for TLS
//   secure: true, 
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASS

//     }
// });

//========================
app.use(express.static("public"));
var cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET
})

//==========
app.use(express.urlencoded(true))//for getting data from post type
app.listen(2008, function () {
    console.log("server started successfully");
})
app.use(express.static("public"));
app.get("/", function (req, resp) {
    var path = __dirname + "/public/index.html";
    resp.sendFile(path);
})
// require('dotenv').config();
let mysql = require("mysql2");
let url = process.env.AIVEN_URL;
let mysqlCon = mysql.createConnection({uri:url,dateStrings:true});
mysqlCon.connect(function (err) {
    if (err == null)
        console.log("connected successfully");//for aiven connectivity
    else console.log(err.message);
})
//================
app.get("/signup-process", function (req, resp) {
    let emailid = req.query.emailid;
    let pwd = req.query.pwd;
    let utype = req.query.utype;
    mysqlCon.query("insert into userspro values(?,?,?,current_date(),1)", [emailid, pwd, utype], function (err) {
        if (err == null) {
            resp.send("true");
            console.log("success");
            // let mailoptions = {
            //     from: process.env.EMAIL,
            //     to: emailid,
            //     subject: "Welcome to Green Leaf ",
            //     html:
            //         '<h2><b>Welcome!</b></h2><p>Your account has been created successfully and now you are a part of Green Leaf, a platform where we try to serve the Needy in the best way possible!</p>'


            // };
            // transporter.sendMail(mailoptions, function (err) {
            //     if (err)
            //         console.log(err.message);
            //     else
            //         console.log("Welcome mail sent");

            // });
        }
        else {
            resp.send(err.message);
            console.log("fail")
        }

    })

})
//===========================
app.get("/login-process", function (req, resp) {
    let emailid = req.query.emailid;
    let pwd = req.query.pwd;
    mysqlCon.query("select *from userspro where emailid=? and pwd=?", [emailid, pwd], function (err, resultJSONAry) {
        if (err == null) {
            if (resultJSONAry.length == 1)
                 {
                console.log(resultJSONAry[0].emailid);
                if (resultJSONAry[0].active == 1) {
                    // let ret = "valid credentials,the status is not blocked and ";
                    // resp.send("valid credentials and not blocked ")
                    // if (resultJSONAry[0].utype == "Donor")
                    //     ret = ret + "User is registered as Donor";
                    // if (resultJSONAry[0].utype == "Needy")
                    //     ret = ret + "User is registered as Needy"
                    // if (resultJSONAry[0].utype == "NGO")
                    //     ret = ret + "User is registered as NGO";
                    console.log(resultJSONAry[0].utype)
                    resp.send(resultJSONAry);

                }
                else {
                    resp.send("blocked");
                }
            }
            else
                resp.send("invalid credentials");

        }
        else {
            resp.send(err.message);
        }
    })

})
//================================================
app.get("/email-blur-ajax", function (req, resp) {
    let emailid = req.query.email;
    mysqlCon.query("select *from userspro where emailid=?", [emailid], function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null)
            resp.send(resultJSONAry);
        else resp.send(err.message);
    })
})
app.get("/donor-profile-btn", function (req, resp) {
    let path = __dirname + "/public/donor-profile.html"
    resp.sendFile(path);
})
app.get("/avail-med-btn", function (req, resp) {
    let path = __dirname + "/public/availmed.html"
    resp.sendFile(path);
})
app.get("/avail-equip-btn", function (req, resp) {
    let path = __dirname + "/public/availequip.html"
    resp.sendFile(path);
})
app.get("/admin-portal-btn",function(req,resp){
    let path=__dirname+"/public/admin-users-dash.html"
    resp.sendFile(path);
})
app.get("/admin-donors-btn",function(req,resp){
    let path=__dirname+"/public/admin-donors-dash.html"
    resp.sendFile(path);
})
app.get("/dash-donors-btn",function(req,resp){
    let path=__dirname+"/public/dash-donor.html";
    resp.sendFile(path);
})
app.get("/admin-dash-btn",function(req,resp){
    let path=__dirname+"/public/admin-dash.html"
    resp.sendFile(path);
})
app.get("/admin-med-view",function(req,resp){
    let path=__dirname+"/public/all-medecines.html"
    resp.sendFile(path);
})
app.get("/admin-view-equip",function(req,resp){
      let path=__dirname+"/public/all-equipments.html"
    resp.sendFile(path);
})
app.get("/get-med-btn",function(req,resp){
     let path=__dirname+"/public/get-med.html"
    resp.sendFile(path);
})
app.get("/get-equip-btn",function(req,resp){
     let path=__dirname+"/public/get-equip.html"
    resp.sendFile(path);
})
app.get("/ngo-reg-btn",function(req,resp){
      let path=__dirname+"/public/NGO-Registration.html"
    resp.sendFile(path);
})
app.get("/ngo-finder-btn",function(req,resp){
      let path=__dirname+"/public/ngo-finder.html"
    resp.sendFile(path); 
})
app.get("/needy-profile-btn",function(req,resp){
     let path=__dirname+"/public/needy.html"
    resp.sendFile(path); 
})
//========================================
app.post("/donor-profile", async function (req, resp) {
    console.log(req.body)
    let emailid = req.body.txtEmail;
    let dname = req.body.txtName;
    let mobile = req.body.txtMobile;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;
    let msg = "no aadhar uploaded";
    console.log("lets see");
    let myaadhar = "nopic.jpg"//kepp it b y default
    console.log(myaadhar);
    if (req.files!= null && req.files.aadharpic!= null) {
        let fileName = req.files.aadharpic.name;
        let fullpath = __dirname + "/uploads/" + fileName;
        await req.files.aadharpic.mv(fullpath);//files is object like query and body
        msg = "aadhar uploaded successfully";
        console.log(msg);
        console.log(fileName);
        console.log(fullpath);
        console.log(process.env.CLOUD_NAME);
        console.log(process.env.CLOUD_API);
        // await cloudinary.uploader.upload(fullpath).then(function (picUrlResult) {
        //     myaadhar = picUrlResult.url;//gives the url of pic on cloudinary
        //     console.log("************");
        //     console.log(myaadhar);

        // });
          try {
    const picUrlResult = await cloudinary.uploader.upload(fullpath);
    myaadhar = picUrlResult.secure_url;
    console.log("************");
    console.log(myaadhar);
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message || err);
    console.error(JSON.stringify(err, null, 2));
  }
    }
    let msg2 = "no profile pic uploaded";
    let myprofilepic = "nopic.jpg";
    if (req.files != null && req.files.profilepic != null) {
        let filename = req.files.profilepic.name;
        let fullPath = __dirname + "/uploads/" + filename;
        await req.files.profilepic.mv(fullPath);
        msg = "profilepic uploaded suucesfully";
        console.log(msg);
        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myprofilepic = picUrlResult.url;
            console.log("******");
            console.log(myprofilepic);
        })
    }
    mysqlCon.query("insert into dprofiles values(?,?,?,?,?,?,?)", [emailid, dname, mobile, address, city, myaadhar, myprofilepic], function (err) {
        if (err == null) {
            resp.sendFile(__dirname + "/public/response.html");

        }
        else {
            resp.send(err.message);
        }
    })
})
//=================================================================
app.post("/modify-donor-profile", async function (req, resp) {

    let emailid = req.body.txtEmail;
    let dname = req.body.txtName;
    let mobile = req.body.txtMobile;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;
    let msg = "no aadhar uploaded";
    let myaadhar = "nopic.jpg"//kepp it b y default
      
    if (req.files!=null&& req.files.aadharpic != null) {
        let fileName = req.files.aadharpic.name;
        let fullpath = __dirname + "/uploads/" + fileName;
        await req.files.aadharpic.mv(fullpath);//files is object like query and body
        msg = "aadhar uploaded successfully";
        await cloudinary.uploader.upload(fullpath).then(function (picUrlResult) {
            myaadhar = picUrlResult.url;//gives the url of pic on cloudinary
            // console.log("************");
            // console.log(myaadhar);

        })
    }
    else {
        myaadhar=req.body.hdn1;
    }
       let msg2 = "no profile pic uploaded";
    let myprofilepic = "nopic.jpg";
    if (req.files!=null&&req.files.profilepic != null) {
        let filename = req.files.profilepic.name;
        let fullPath = __dirname + "/uploads/" + filename;
        await req.files.profilepic.mv(fullPath);
        msg = "profilepic uploaded suucesfully";
        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myprofilepic = picUrlResult.url;
            // console.log("******");
            // console.log(myprofilepic);just for seeing the output in console
        })
    }
    else{
        myprofilepic=req.body.hdn2;
    }
    
    console.log(myaadhar);
    console.log("8******");
    console.log(myprofilepic);
       mysqlCon.query("update dprofiles set dname=?,mobile=?,address=?,city=?,picpath=?,acardpath=? where emailid=? ", [dname, mobile, address, city, myprofilepic, myaadhar, emailid], function (err) {
            if (err == null) {
                resp.sendFile(__dirname + "/public/response.html");


            }
            else {
                resp.send(err.message);
            }
        })
    // if (req.files != null && req.files.aadharpic != null) {
    //     let fileName = req.files.aadharpic.name;
    //     let fullpath = __dirname + "/uploads/" + fileName;
    //     await req.files.aadharpic.mv(fullpath);//files is object like query and body
    //     msg = "aadhar uploaded successfully";
    //     await cloudinary.uploader.upload(fullpath).then(function (picUrlResult) {
    //         myaadhar = picUrlResult.url;//gives the url of pic on cloudinary
    //         // console.log("************");
    //         // console.log(myaadhar);

    //     })
    // }
    // let msg2 = "no profile pic uploaded";
    // let myprofilepic = "nopic.jpg";
    // if (req.files != null && req.files.profilepic != null) {
    //     let filename = req.files.profilepic.name;
    //     let fullPath = __dirname + "/uploads/" + filename;
    //     await req.files.profilepic.mv(fullPath);
    //     msg = "profilepic uploaded suucesfully";
    //     await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
    //         myprofilepic = picUrlResult.url;
    //         // console.log("******");
    //         // console.log(myprofilepic);just for seeing the output in console
    //     })
    // }

    // if (req.files == null) {
    //     mysqlCon.query("update dprofiles set dname=?,mobile=?,address=?,city=? where emailid=? ", [dname, mobile, address, city, emailid], function (err) {
    //         if (err == null) {
    //             resp.sendFile(__dirname + "/public/response.html");

    //         }
    //         else {
    //             resp.send(err.message);
    //         }
    //     })
    // }
    // if (req.files.aadharpic != null && req.files.profilepic == null) {
    //     mysqlCon.query("update dprofiles set dname=?,mobile=?,address=?,city=?,acardpath=? where emailid=? ", [dname, mobile, address, city, myaadhar, emailid], function (err) {
    //         if (err == null) {
    //             resp.sendFile(__dirname + "/public/response.html");

    //         }
    //         else {
    //             resp.send(err.message);
    //         }
    //     })
    // }
    // if (req.files.aadharpic == null && req.files.profilepic != null) {
    //     mysqlCon.query("update dprofiles set dname=?,mobile=?,address=?,city=?,picpath=? where emailid=? ", [dname, mobile, address, city, myprofilepic, emailid], function (err) {
    //         if (err == null) {
    //             resp.sendFile(__dirname + "/public/response.html");

    //         }
    //         else {
    //             resp.send(err.message);
    //         }
    //     })
    // }
    // if (req.files.aadharpic != null && req.files.profilepic != null) {
    //     mysqlCon.query("update dprofiles set dname=?,mobile=?,address=?,city=?,picpath=?,acardpath=? where emailid=? ", [dname, mobile, address, city, myprofilepic, myaadhar, emailid], function (err) {
    //         if (err == null) {
    //             resp.sendFile(__dirname + "/public/response.html");


    //         }
    //         else {
    //             resp.send(err.message);
    //         }
    //     })
    // }
})
//========================================
app.get("/get-data", function (req, resp) {
    let emailid = req.query.emailid;
    mysqlCon.query("select *from dprofiles where emailid=?", [emailid], function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//============================================
app.post("/availmed", async function (req, resp) {
    let emailid = req.body.txtEmail;
    let medname = req.body.txtMed;
    let expdate = req.body.expdate;
    let company = req.body.txtCompany;
    let packing = req.body.packing;
    let qty = req.body.qty;
    let info = req.body.txtinfo;
    let picurl = "nopic.jpg";
    let fileName = req.files.medpic.name;
    let fullPath = __dirname + "/uploads/" + fileName;
    await req.files.medpic.mv(fullPath);
    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
        picurl = picUrlResult.url;
    })
    mysqlCon.query("insert into medecines values(?,?,?,?,?,?,?,?,?)", [null, emailid, medname, expdate, company, packing, qty, info, picurl], function (err) {
        if (err == null)
         resp.sendFile(__dirname + "/public/response.html");
        else resp.send(err.message);
    })
})
//===============================================
app.post("/avail-for-needy", async function (req, resp) {
    let emailid = req.body.txtEmail;
    let equipment = req.body.txtmedequip;
    let condition = req.body.medcond;
    let type = req.body.status;
    let amount = req.body.amount;
    let pic1url = "nopic.jpg";
    let fileName = req.files.pic1.name;
    let fullPath = __dirname + "/uploads/" + fileName;
    await req.files.pic1.mv(fullPath);
    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
        pic1url = picUrlResult.url;
    })
    let pic2url = "nopic.jpg"
    let filename = req.files.pic2.name;
    let fullpath = __dirname + "/uploads/" + filename;
    await req.files.pic1.mv(fullpath);
    await cloudinary.uploader.upload(fullpath).then(function (picUrlResult) {
        pic2url = picUrlResult.url;
    })
    let info = req.body.otherinfo;
    mysqlCon.query("insert into equipments26 values(?,?,?,?,?,?,?,?,?)", [null, emailid, equipment, condition, type, amount, pic1url, pic1url, info], function (err) {
        if (err == null) {
            resp.sendFile(__dirname + "/public/response.html");

        }
        else resp.send(err.message);
    })
})
//===========
app.get("/fetch-data",function(req,resp){
     mysqlCon.query("select *from userspro ",  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//====================
app.get("/do-block",function(req,resp){
    let emailid=req.query.emailkey;
      mysqlCon.query("update userspro set active=0 where emailid=? ", [emailid], function (err) {
            if (err == null) {
                //resp.sendFile(__dirname + "/public/response.html");
                 resp.send("updated")

            }
            else {
                resp.send(err.message);
            }
        })

})
//=================
app.get("/do-resume",function(req,resp){
    let emailid=req.query.emailkey;
       mysqlCon.query("update userspro set active=1 where emailid=? ", [emailid], function (err) {
            if (err == null) {
                //resp.sendFile(__dirname + "/public/response.html");
                resp.send("updated")
                 

            }
            else {
                resp.send(err.message);
            }
        })
})
//==================
app.get("/delete-user",function(req,resp){
    let emailid=req.query.emailid;
      mysqlCon.query("delete from userspro  where emailid=? ", [emailid], function (err) {
            if (err == null) {
                //resp.sendFile(__dirname + "/public/response.html");
                resp.send("updated")
                 

            }
            else {
                resp.send(err.message);
            }
        })
})
//==================
app.get("/fetch-data-donors",function(req,resp){
     mysqlCon.query("select *from dprofiles ",  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//===================
app.get("/fetch-data-dash-donor",function(req,resp){
    let emailid=req.query.email;
        mysqlCon.query("select *from medecines where emailid=?",[emailid],  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//=================
app.get("/do-delete-dash-donor",function(req,resp){
    let rid=req.query.rid;
     mysqlCon.query("delete from medecines where rid=? ",[rid], function (err) {
            if (err == null) {
                //resp.sendFile(__dirname + "/public/response.html");
                resp.send("updated")
                 

            }
            else {
                resp.send(err.message);
            }
        })
})
//=================
app.get("/fetch-data-dash-donor-equip",function(req,resp){
      let emailid=req.query.email;
        mysqlCon.query("select *from equipments26 where emailid=?",[emailid],  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//===================
app.get("/do-delete-dash-donor-equip",function(req,resp){
      let rid=req.query.rid;
     mysqlCon.query("delete from equipments26 where rid=? ",[rid], function (err) {
            if (err == null) {
                //resp.sendFile(__dirname + "/public/response.html");
                resp.send("updated")
                 

            }
            else {
                resp.send(err.message);
            }
        })
})
//==================
app.get("/do-update",function(req,resp){
    console.log("ho")
    let emailid=req.query.email;
    let pwd=req.query.pwd;
    let newpwd=req.query.newpwd;
    console.log(emailid);
      console.log(pwd);
        console.log(newpwd);
    
      mysqlCon.query("update userspro set pwd=? where emailid=? and pwd=? ", [newpwd,emailid,pwd], function (err,result) {
            if (err == null) {
                if(result.affectedRows==1)
                {
                    resp.send(1);
                }
                else{
                    resp.send(0);
                }
//{resp.sendFile(__dirname + "/public/response.html");}

                // resp.send("updated")
                  }
            else {
                resp.send(err.message);
            }
        })
})
app.get("/do-update-needy",function(req,resp){
    console.log("hi")
    let emailid=req.query.email;
    let pwd=req.query.pwd;
    let newpwd=req.query.newpwd
      mysqlCon.query("update userspro set pwd=? where emailid=? and pwd=? ", [newpwd,emailid,pwd], function (err,result) {
        console.log(result.affectedRows);
            if (err == null) {
                if(result.affectedRows==1)
                {
                    resp.send(1);
                }
                else{
                    resp.send(0);
                }
//{resp.sendFile(__dirname + "/public/response.html");}

                // resp.send("updated")
                  }
            else {
                resp.send(err.message);
            }
        })
})
//==============
app.get("/fetch-med-data",function(req,resp){
         mysqlCon.query("select *from medecines ",  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
app.get("/fetch-equip-data",function(req,resp){
         mysqlCon.query("select *from equipments26 ",  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//=============
app.get("/fetch-all-cities",function(req,resp){
        mysqlCon.query("select distinct city from dprofiles ",  function (err, resultJSONAry) {//this will get all the cities where donors are present distinctly, agar do owner same jagah se hain toh ek baar hi jagan dikhegi
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
app.get("/do-fetch-inner-join-med",function(req,resp){
    let city=req.query.city
        mysqlCon.query("select distinct medname from medecines AS m INNER JOIN dprofiles AS d ON m.emailid=d.emailid where d.city=? ",[city],  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
app.get("/fetch-all-med-get",function(req,resp){
    let medname=req.query.medname;
    let city=req.query.city
         mysqlCon.query("select *from medecines AS m INNER JOIN dprofiles AS d ON m.emailid=d.emailid where m.medname=? and d.city=?",[medname,city], function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//=======
app.get("/do-fetch-inner-join-equip",function(req,resp){
    let city=req.query.city
        mysqlCon.query("select distinct equipment from equipments26 AS e INNER JOIN dprofiles AS d ON e.emailid=d.emailid where d.city=? ",[city],  function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
//==========
app.get("/fetch-all-equip-get",function(req,resp){
    let equipment=req.query.equipment;
    let city=req.query.city;
    let etype=req.query.etype;
    if(etype=="borrow")
    {
         mysqlCon.query("select *from equipments26 AS e INNER JOIN dprofiles AS d ON e.emailid=d.emailid where e.equipment=? and d.city=? and e.etype='donation' ",[equipment,city], function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })}
    else {
            mysqlCon.query("select *from equipments26 AS e INNER JOIN dprofiles AS d ON e.emailid=d.emailid where e.equipment=? and d.city=? and e.etype='forsale' ",[equipment,city], function (err, resultJSONAry) {
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
    }
})
//===========================
app.post("/register",async function(req,resp){
    let picurl="nopic.jpg";
     let fileName = req.files.regproof.name;
    let fullPath = __dirname + "/uploads/" + fileName;
    await req.files.regproof.mv(fullPath);
    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
        picurl = picUrlResult.url;
    })
    let emailid=req.body.txtEmail;
    let ngo=req.body.txtngo;
    let regoffice=req.body.reg_off;
    let city=req.body.city;
    let website=req.body.website;
    let contactno=req.body.mobile;
    let since=req.body.date;
    let chairperson=req.body.chair_per;
    let ngoworks=req.body.ngo_pro;
    let regnumber=req.body.reg_num;
     mysqlCon.query("insert into ngos values(?,?,?,?,?,?,?,?,?,?,?)", [emailid,ngo,regoffice, city, website, contactno, since,chairperson, ngoworks, regnumber, picurl], function (err) {
        if (err == null)
         resp.sendFile(__dirname + "/public/response.html");
        else resp.send(err.message);
    })
})
app.get("/fetch-cities",function(req,resp){
         mysqlCon.query("select distinct city from ngos ",  function (err, resultJSONAry) {//this will get all the cities distinctly
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })
})
app.get("/fetch-ngos-city",function(req,resp){
    let city=req.query.city
        mysqlCon.query("select *from ngos where city=? ",[city],  function (err, resultJSONAry) {//this will get all the cities distinctly
        console.log(resultJSONAry)
        if (err == null) {
            resp.send(resultJSONAry);
        }
        else {
            resp.send(err.message);
        }
    })  
})
//======================
const {GoogleGenerativeAI}=require("@google/generative-ai");
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API);
const model=genAI.getGenerativeModel({model:"gemini-3.5-flash"});
//======
async function ai_fetchdata_aadhar(imgurl){
    const myprompt="Read the text on picture and tell all the information in aadhar card and give output STRICTLY in JSON format {aadhar_number:'',name:'',gender:'',dob:''} and also extract the date in the format which is accepted by sql table for date.Dont give output as string."
    const imageResp=await fetch(imgurl)
    .then((response) => response.arrayBuffer());
    const result=await model.generateContent([
        {
            inlineData:{
                data:Buffer.from(imageResp).toString("base64"),
                mimeType:"image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
    const cleaned=result.response.text().replace(/```json|```/g,'').trim();
    const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData
}
async function ai_fetchdata_aadharrear(imgurl){
    const myprompt="Read the text on picture and tell all the information in aadhar card and give output STRICTLY in JSON format {address:''}.Dont give output as string."
    const imageResp=await fetch(imgurl)
    .then((response) => response.arrayBuffer());
    const result=await model.generateContent([
        {
            inlineData:{
                data:Buffer.from(imageResp).toString("base64"),
                mimeType:"image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
    const cleaned=result.response.text().replace(/```json|```/g,'').trim();
    const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData
}


app.post("/ai-read-pic",async function(req,resp){
     let jsonResultFromAi;
     let msg="File not Uploaded";
    let myUrlfront="nopic.jpg";
    if(req.files!=null&&req.files.apicf!=null)
    {
        let fileName=req.files.apicf.name;
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.apicf.mv(fullPath);
        msg="Uploaded Successfully";

       await cloudinary.uploader.upload(fullPath).then(async function(picUrlResult)
        {
            myUrlfront=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrlfront);
             jsonResultFromAi=await ai_fetchdata_aadhar(myUrlfront);
             console.log(jsonResultFromAi);
            //resp.send(jsonResultFromAi);

      });

    }
    let emailid=req.body.txtEmail;
    let mobile=req.body.mobile;
    let fronturl=myUrlfront;
    let name=jsonResultFromAi.name;
    let acardno=jsonResultFromAi.aadhar_number;
    let gender=jsonResultFromAi.gender;
    let dob=jsonResultFromAi.dob;
     let jsonResultFromAirear;
     let msgrear="File not Uploaded";
    let myUrlrear="nopic.jpg";
    if(req.files!=null&&req.files.apicr!=null)
    {
        let fileName=req.files.apicr.name;
        let fullPath=__dirname+"/uploads/"+fileName;
        await req.files.apicr.mv(fullPath);
        msgrear="Uploaded Successfully";

       await cloudinary.uploader.upload(fullPath).then(async function(picUrlResult)
        {
            myUrlrear=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrlrear);
             jsonResultFromAirear=await ai_fetchdata_aadharrear(myUrlrear);
             console.log(jsonResultFromAirear);
            //resp.send(jsonResultFromAi);

      });

    }
    let rearurl=myUrlrear;
    let address=jsonResultFromAirear.address;
    //=================
    mysqlCon.query("insert into needys values(?,?,?,?,?,?,?,?,?)",[emailid,mobile,fronturl,rearurl,name,acardno,address,gender,dob],function(err){
        if(err==null)
        {
            resp.sendFile(__dirname+"/public/response.html");
        }
        else
        {
            resp.send(err.message);
        }
    })


})