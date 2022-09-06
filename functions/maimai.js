import * as cheerio from "cheerio";
import axios from "axios";
import pLimit from "p-limit";
import "dotenv/config";

const id = process.env["SEGA_ID"];
const password = process.env["SEGA_PASS"];

let maimai = {};

const limit = pLimit(5);

const maimaiLoginPage = "https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=maimaidxex&redirect_url=https://maimaidx-eng.com/maimai-mobile/&back_url=https://maimai.sega.com/";
const maimaiLogin = {
  url: "https://lng-tgk-aime-gw.am-all.net/common_auth/login/sid/",
  method: "POST",
  headers: {
    'Cookie': "",
  },
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status <= 302
  },
  data: `retention=0&sid=${id}&password=${password}`
};
const maimaiGetAnotherCookie = {
  url: "",
  method: "GET",
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status <= 302
  },
  headers: {
    'Cookie': "",
  },
};

let maimaiPage = axios.create({
  baseURL: "https://maimaidx-eng.com/maimai-mobile/",
  method: "GET",
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status <= 302
  },
  headers: {
    'Cookie': "",
  }
});

let maimaiCookies = "";

maimai.RefreshCookie = async () => {
  var response;

  response = await axios(maimaiLoginPage);
  maimaiLogin.headers['Cookie'] = response.headers['set-cookie'];

  response = await axios(maimaiLogin);
  maimaiGetAnotherCookie.url = response.headers['location'];
  maimaiGetAnotherCookie.headers['Cookie'] = response.headers['set-cookie'];

  response = await axios(maimaiGetAnotherCookie);
  maimaiCookies = response.headers['set-cookie'];
  console.log(maimaiCookies);
}

maimai.GetPlayerProfileById = async (id) => {
  var response = await limit(() => maimaiPage(`/friend/search/searchUser/?friendCode=${encodeURIComponent(id)}`, {
    headers: {
      'Cookie': maimaiCookies
    }
  }));

  var $ = cheerio.load(response.data)

  return {
    name: $('.name_block').text().trim(),
    avatar: $(".f_l").eq(0).attr('src'),
    grade: $(".h_35").eq(0).attr('src'),
    trophy: $(".trophy_inner_block").text().trim(),
    trophy_status: $(".trophy_block").attr(["classList"][1]),
    rating: $(".rating_block").text().trim(),
    rating_max: $(".f_r .p_r_5").text().trim() ? $(".f_r .p_r_5").text().trim() : "（ノーデータ）",
    rating_block: $(".h_30").eq(0).attr('src'),
    star: $('.f_14').text().trim(),
    comment: $('.friend_comment_block').text().trim() ? $('.friend_comment_block').text().trim() : "（ノーコメント）"
  };
};

export default maimai;