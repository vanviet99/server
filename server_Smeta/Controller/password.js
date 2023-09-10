const nodemailer = require('nodemailer');
const user = require('../Modal/userModal');
const crypto = require('crypto');
const bcrypt = require("bcrypt");


function generateAuthCode() {
  const buffer = crypto.randomBytes(4);
  return buffer.toString('hex').toUpperCase();
}
async function sendAuthCode(req, res) {
  const { email } = req.body;
  const code = generateAuthCode();
  const usercode = await user.updateOne({email:req.body.email},{code:code})
  const usernamecode = await user.findOne({username:req.body.username})

  if(usercode.modifiedCount=== 1 && usernamecode){
    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'mon01092003@gmail.com', 
          pass: 'lhrbzxysxpbmqxob' 
        }
      });
      
      const mailOptions = {
        from: 'mon01092003@gmail.com',
        to: req.body.email, 
        subject: 'Mã xác thực',
        text: `Mã xác thực của bạn là: ${code}`
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(401).json(error);
        } else {
           res.status(200).json(`Email sent: ' +${code}`) ;
        }
      });
  }else{
    let message = usercode.modifiedCount=== 1 ? 'Username không chính xác' : 'Email không tồn tại'
    res.status(401).json(message)
  }  
}

async function passwordretrieval(req, res) {
    const { email, code } = req.body;
    try {
      const users = await user.findOne({ email:req.body.email, code: req.body.code }); 
      if (!users) {
        return res.status(404).json({ error: 'Mã xác thực không chính xác' });
      }
      const data = await user.updateOne({email:req.body.email},{code:null})
      const bta = await user.findOne({email:req.body.email})
      const pass = bta.password
      // const passwordMatch = await bcrypt.compare(password,pass);
      res.status(200).json({ message: 'Thành công',pass });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi khi truy vấn cơ sở dữ liệu' });
    }
  }
  
module.exports = { sendAuthCode ,passwordretrieval};
