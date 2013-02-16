(function () {
  var id = sfdcPage.getEntityId();

  if (!/^015/.test(id)) {
    alert('対象ドキュメントの参照画面で実行してください');
    return;
  }

  if (window.sforce) {
    onConnectionJsReady();
  } else {
    loadConnectionJs(onConnectionJsReady);
  }

  function format(str, obj) {
    return Sfdc.String.format(str, obj);
  }
  function loadConnectionJs(callback) {
    var el = document.createElement('script');
    el.onload = function () {
      sforce.connection.sessionId = ApiUtils.getSessionId();
      callback();
    };
    el.src = '/soap/ajax/27.0/connection.js';
    document.head.appendChild(el);
  }
  function onConnectionJsReady() {
    var oldValue,
        so,
        msg;
    oldValue = getCurrentContentType();
    so = new sforce.SObject('Document');
    so.Id = id;
    so.ContentType = oldValue;
    toggleCharset(so);
    msg = format(
      'このドキュメントのMIMEタイプを {old} から {new} に変更します。\nよろしいですか？',
      {'old': oldValue, 'new': so.ContentType}
    );
    if (confirm(msg)) {
      update(so);
    }
  }
  function getCurrentContentType() {
    var query = format('SELECT ContentType FROM Document WHERE Id = \'{id}\'', {id: id}),
        qr;
    qr = sforce.connection.query(query);
    return qr.records.ContentType;
  }
  function toggleCharset(sobject) {
    if (/; *?charset/i.test(sobject.ContentType)) {
      removeCharset(sobject);
    } else {
      addCharset(sobject);
    }
  }
  function addCharset(sobject) {
    sobject.ContentType = sobject.ContentType + '; charset=UTF-8';
  }
  function removeCharset(sobject) {
    sobject.ContentType = sobject.ContentType.replace(/; *?charset=UTF-8/i, '');
  }
  function update(sobject) {
    var results;
    results = sforce.connection.update([sobject]);
    if (results[0].getBoolean('success')) {
      location.reload();
    } else {
      alert('更新に失敗しました。');
      console.log(results);
    }
  }
}());