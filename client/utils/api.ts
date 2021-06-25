import config from '../../config';
const url = config.apiUrl;

// params is given as a JSON
export function get(endpoint, headers={}) {
  return fetch(`${url}${endpoint}`, { headers: headers }).then(async res => {
    if(res.ok){
      return res.json();
    } else{
      const json = await res.json();
      return { ...json, status: res.status };
    }
  });
}

//make sure headers includes 'Content-type': 'application/json'
export function post(endpoint, params) {
  return fetch(`${url}${endpoint}`, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(async res => {
    if(res.ok) {
      return res.json();
    } else {
      const json = await res.json();
      return { ...json, status: res.status };
    }
  });
}

export function put(endpoint, params) {
  return fetch(`${url}${endpoint}`, {
    method: 'put',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(async res => {
    if(res.ok){
      return res.json();
    } else{
      const json = await res.json();
      return { ...json, status: res.status };
    }
  });
}

export function triggerCrawler() {
  post('/admin/crawler', {});
}

export function getJsonFromUrl(url) {
  if(!url) url = location.search;
  var query = url.substr(1);
  var result = {};
  query.split('&').forEach(function(part) {
    var item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
