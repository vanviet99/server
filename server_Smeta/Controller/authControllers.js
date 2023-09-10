const userModal = require("../Modal/userModal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authController = {
  registerUser: async (req, res) => {
    try {
      console.log(req.body);
      const checkemail = await userModal.find({ email: req.body.email });
      if (checkemail.length !== 0) {
        return res.status(401).json({ message: "Email đã tồn tại" });
      }

      const checkusername = await userModal.find({ username: req.body.username });
      if (checkusername.length !== 0) {
        return res.status(401).json({ message: "Tên người dùng đã tồn tại" });
      }
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, salt);
      let newUser = await userModal.create({
        username: req.body.username,
        password: password,
        email: req.body.email,
      });
      const userdata = await userModal.find();

      res.status(200).json({ message: "Đăng ký thành công", userdata });
    } catch (error) {
      res.status(500).json({ message: "Đăng ký error", error });
    }
  },
  generateToken: (payload) => {
    const { userId, username, email, role } = payload;
    const accessToken = jwt.sign(
      { userId, username, email, role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { userId, username, email, role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    return { accessToken, refreshToken };
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await userModal.findOne({ username });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Tên người dùng không tồn tại" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Mật khẩu không đúng" });
      }
      const token = authController.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      // res.cookie( 'token1231231', JSON.stringify(token) , {expires: new Date( Date.now() + 30000)})
      let user_refreshToken = await userModal.updateOne(
        { username: user.username },
        { refreshToken: token.refreshToken }
      );
      res.status(200).json({ message: "Đăng nhập thành công", token });
    } catch (error) {
      res.status(500).json({ message: "Lỗi đăng nhập", error });
    }
  },
  posttoken: async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) res.status(401);
    const user = await userModal.findOne({ refreshToken: refreshToken });
    console.log(user);
    if (!user) {
      return res.status(403);
    }
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const token = authController.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      const user_refreshToken = await userModal.updateOne(
        { username: user.username },
        { refreshToken: token.refreshToken }
      );
      res.status(200).json(token);
    } catch (error) {
      res.status(403);
    }
  },
  logout: async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Không có username" });
      }
      const user = await userModal.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      const refreshToken = user.refreshToken;

      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: "Người dùng không có refreshToken" });
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res
              .status(403)
              .json({ message: "Refresh token không hợp lệ" });
          }
          const result = await userModal.updateOne(
            { username: username },
            { $unset: { refreshToken: 1 } }
          );

          if (result.modifiedCount === 1) {
            return res.status(200).json({ message: "Đăng xuất thành công" });
          } else {
            return res
              .status(401)
              .json({ message: "Không tìm thấy refreshToken" });
          }
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Lỗi đăng xuất", error });
    }
  },
  test_verifyToken: async (req, res) =>{
    res.status(200).json(req.user)
  }
};

module.exports = authController;
