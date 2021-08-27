// params is given as a JSON
export function get(endpoint, headers) {
  return fetch(endpoint, {headers: headers}).then(res => {
    if(res.ok){
      return res.json()
    } else{
      return res
    }
  });
}

//make sure headers includes 'Content-type': 'application/json'
export function post(endpoint, params) {
  return fetch(endpoint, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(params)
  }).then(res => {
    if(res.ok){
      return res.json();
    } else{
      return res
    }
  });
}

export function put(endpoint, params) {
  return fetch(endpoint, {
    method: 'put',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  }).then(res => {
    if(res.ok){
      return res.json()
    } else{
      return res
    }
  });
}

export function getJsonFromUrl(url) {
  if(!url) url = location.search;
  var query = url.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

