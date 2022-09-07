import express from "express";
import maimai from "./functions/maimai.js";
import generateCard from "./functions/generateCard.js";

// Express server
const app = express();

app.listen(8080, async () => {
  await maimai.RefreshCookie();
  console.log("Page started.");
});

app.get("/getUser/:useridx", async (req, res) => {
  const data = await maimai.GetPlayerProfileById(req.params.useridx, false);
  if (data == "Invalid code" || data == "Not found") return res.status(400).json([{
    error: data,
    code: "400"
  }]);
  return res.status(200).json([{
    name: data.name,
    avatar: data.avatar,
    grade: data.grade,
    trophy: data.trophy,
    trophy_status: (data.trophy_status.class.split(" "))[1],
    rating: data.rating,
    rating_max: data.rating_max,
    rating_block: ((((data.rating_block.split("?"))[0].split("/")).reverse())[0]).split(".")[0],
    star: data.star,
    comment: data.comment
  }]);
});

app.get("/render/:useridx", async (req, res) => {
  const data = await generateCard.generate(req.params.useridx);
  if (data == "Invalid code" || data == "Not found") return res.status(400).json([{
    error: data,
    code: "400"
  }]);
  const img = Buffer.from(data, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.status(200).end(img);
})
