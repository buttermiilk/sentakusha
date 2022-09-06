import puppeteer from "puppeteer";
import colors from "../util/colors.js";
import fetch from "node-fetch";
import fs from "fs";

let generateCard = {};

generateCard.render = async (user) => {
  const browser = await puppeteer.launch({ 'args': ['--no-sandbox', '--disable-setuid-sandbox'] });
  let page = await browser.newPage();
  const content = fs.readFileSync(`${process.cwd()}/util/template.svg`, 'utf8');
  await page.setContent(content);
  let SVG = await page.$("svg");

  await SVG.evaluate((element, user, colors) => {
    let rank_type = user['rating_block'];
    element.querySelector('#rank_bg').style.fill = colors.rank_colors[rank_type]['fill'];
    element.querySelector('#rank_border').style.fill = colors.rank_colors[rank_type]['border'];
    element.querySelector('#rank_shadow').style.fill = colors.rank_colors[rank_type]['border'];

    element.querySelector('#trophy_bg').style.fill = `url(#${user['trophy_status']})`;
    element.querySelector('#trophy_border').style.fill = colors.trophy_colors[user['trophy_status']]['border'];
    element.querySelector('#trophy_shadow').style.fill = colors.trophy_colors[user['trophy_status']]['border'];

    let imageLoad = new Promise((resolve, reject) => {
      let image = element.querySelector('#Image');
      image.onload = () => resolve();
      image.onerror = () => reject();
      image.href.baseVal = user['avatar'];
    });
    let gradeLoad = new Promise((resolve, reject) => {
      let grade = element.querySelector('#Grade');
      grade.onload = () => resolve();
      grade.onerror = () => reject();
      grade.href.baseVal = user['grade'];
    });
    element.querySelector('#Trophy').innerHTML = user['trophy'];
    element.querySelector('#Username').innerHTML = user['name'];
    element.querySelector('#Rank').innerHTML = user['rating'];
    element.querySelector('#Max_rank').innerHTML = user['rating_max'];
    element.querySelector('#Stars').innerHTML = user['star'];
    element.querySelector('#Comment').innerHTML = user['comment'];
    return Promise.all([imageLoad, gradeLoad]);
  }, user, colors);

  return await SVG.screenshot({ type: 'png' });
};

generateCard.generate = async (id) => {
  const res = await fetch(`http://localhost:8080/maimai/getuser/${id}`).then(r => r.json());
  return await generateCard.render(res[0]);
};

export default generateCard;