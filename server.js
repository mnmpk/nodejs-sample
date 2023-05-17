const express = require("express");
const mongoose = require("mongoose");
const User = require('./user');

const app = express();

app.use(express.json());

//4.4.15
//mongoose.connect('mongodb+srv://admin:admin@cluster0.uskpz.mongodb.net/admin?retryWrites=true&w=majority',
//5.0
//mongoose.connect('mongodb+srv://admin:admin@atlassearch.uskpz.mongodb.net/admin?retryWrites=true&w=majority',
mongoose.connect('mongodb+srv://admin:admin@demo.uskpz.mongodb.net/ha?retryWrites=true&w=majority',
  { serverApi: { version: '1', strict: true } }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", async function () {
  console.log("Connected successfully");
  //db.db.command({"replSetGetStatus": 1})
});
const saveDate = async (name, date) => {
  let user = new User({
    name: name,
    lastActiveAt: date
  })
  console.log(user);
  user = await user.save();
  user = await User.findById(user._id).exec();
  console.log("input: " + date);
  console.log("output: " + user.lastActiveAt);
  console.log("output json: " + user);
  console.log("createdAt: " + user.createdAt);
  console.log("toISOString: " + user.lastActiveAt.toISOString());
  console.log("toUTCString: " + user.lastActiveAt.toUTCString());
  console.log("toLocaleString: " + user.lastActiveAt.toLocaleString());
  console.log("toDateString: " + user.lastActiveAt.toDateString());
}

const updateWithVer = async (id, version, name) => {

  console.log("Update name to: " + name);
  if (await User.findOneAndUpdate({ _id: id, version: version }, { $set: { name: name }, $inc: { version: 1 } })) {
    console.log("success");
  } else {
    console.log("failed. document no found.");
  }
}


app.get('/test-save-date', async (req, res) => {
  await saveDate("String date", '2023-05-17');
  await saveDate("JS date", new Date(2023, 4, 17));
  await saveDate("Number date", 1232345);
  try{
    await saveDate("Not a date", "123dfds456");
  }catch(ex){
    console.error(ex);
  }
  res.send(await User.find({})); 
});

app.get('/test-dirty-update', async (req, res) => {
  let u = new User({
    name: "M Ma",
    lastActiveAt: new Date(),
    version: 1
  })
  u = await u.save();
  await updateWithVer(u.id, u.version, "M");
  await updateWithVer(u.id, u.version, "Ma");

  u = await User.findById(u._id).exec();
  await updateWithVer(u.id, u.version, "MMa");
  res.send((await User.findById(u.id).exec()).toJsonWithLocalDate()); 
});

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});

