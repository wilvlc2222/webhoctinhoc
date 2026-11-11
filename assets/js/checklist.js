/* Small task list for activities that report events (video site, web sim...).
   var t = Checklist(host, fbHost, { lesson, id, tasks: ['text', ...], doneText, ordered: true })
   t.tick(i) marks task i done (when ordered, only after the earlier ones); the star comes when all are done.
   t.done(i) tells whether task i is done. ES5 only. */
(function () {
  window.Checklist = function (host, fb, cfg) {
    var done = {}, n = cfg.tasks.length, awarded = false;
    var ul = Core.el('ul', 'checklist');
    host.appendChild(ul);
    function draw() {
      ul.innerHTML = '';
      for (var i = 0; i < n; i++) ul.appendChild(Core.el('li', done[i] ? 'done' : '', '<span class="ico">' + (done[i] ? Icons.check : Icons.starEmpty) + '</span><span>' + cfg.tasks[i] + '</span>'));
    }
    function tick(i) {
      if (done[i]) return true;
      if (cfg.ordered !== false) for (var k = 0; k < i; k++) if (!done[k]) return false;
      done[i] = true; draw();
      var all = true; for (k = 0; k < n; k++) if (!done[k]) all = false;
      if (all && !awarded) { awarded = true; Core.celebrate(fb, cfg.lesson, cfg.id, cfg.doneText); }
      else if (cfg.okText) Core.say(fb, cfg.okText, 'good');
      return true;
    }
    draw();
    return { tick: tick, done: function (i) { return !!done[i]; } };
  };
})();
