/* The two interactive terminals, carried over unchanged in behavior. Only the
   colors are re-pointed at the ink tokens: the originals wrote var(--sumi)
   and var(--sumi), which no longer exist as a hue on this build. */
(function () {
function codemapTerminal() {
    const input = document.getElementById('cm-input');
    if (!input) return;
    const history = document.getElementById('cm-history');
    const C = { p: 'var(--sumi2)', cmd: 'var(--sumi1)', ok: '#276B2B', acc: 'var(--sumi)', mut: '#635C51', txt: '#3B352D' };
    const A = (html) => { const d = document.createElement('div'); d.style.cssText = 'opacity:0;animation:tfade .25s ease forwards;'; d.innerHTML = html; history.appendChild(d); };
    // every response below is real captured output from the carbon map
    const row = (name, kind, loc, sig) => A('<span style="color:' + C.ok + '">' + name + '</span> &nbsp;<span style="color:' + C.mut + '">' + kind + '</span> &nbsp;<span style="color:' + C.txt + '">' + loc + '</span>' + (sig ? ' &nbsp;<span style="color:' + C.mut + '">' + sig + '</span>' : ''));
    const CMD = {
      help: () => { A('<span style="color:' + C.mut + '">available: </span><span style="color:' + C.acc + '">stats, check, def FieldSerializer, callers formula_index, callees formula_index, search formula cycle, clear</span>'); A('<span style="color:' + C.mut + '">every response is captured from a real build of the carbon map</span>'); },
      stats: () => { A('<span style="color:' + C.mut + '">symbol_count &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color:' + C.txt + '">6050</span>'); A('<span style="color:' + C.mut + '">edge_count &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color:' + C.txt + '">11609</span> <span style="color:' + C.mut + '">(11055 extracted, 554 inferred)</span>'); A('<span style="color:' + C.mut + '">dropped_edge_count</span> <span style="color:' + C.txt + '">5245</span>'); },
      check: () => { A('<span style="color:' + C.ok + '">fresh</span><span style="color:' + C.mut + '">: map built at HEAD, working tree clean</span>'); },
      'def FieldSerializer': () => row('FieldSerializer', 'class', 'backend/core/api/serializers.py:71'),
      'callers formula_index': () => { row('react', 'func', 'backend/core/dynamic/reactions.py:38', "react(table, row_id, changed, depth=0, verb='updated')"); A('<span style="color:' + C.mut + '">1 result out of 6,050 indexed symbols.</span>'); },
      'callees formula_index': () => { row('field_name_map', 'func', 'backend/core/dynamic/formula.py:340', 'field_name_map(table, exclude_id=None, fields=None)'); row('parse', 'func', 'backend/core/dynamic/formula.py:347', 'parse(src, fields)'); row('list', 'method', 'backend/core/api/views.py:124', 'list(self, request, *args, **kwargs)'); },
      'search formula cycle': () => row('_reject_formula_cycle', 'method', 'backend/core/api/serializers.py:95', '_reject_formula_cycle(self, fields, this_id, ast)'),
      clear: () => { history.innerHTML = ''; }
    };
    CMD.def = CMD['def FieldSerializer']; CMD.callers = CMD['callers formula_index'];
    CMD.callees = CMD['callees formula_index']; CMD.search = CMD['search formula cycle'];
    CMD['search "formula cycle"'] = CMD['search formula cycle'];
    const run = (raw) => {
      const cmd = (raw || '').trim(); if (!cmd) return;
      const safe = cmd.replace(/[<>]/g, '');
      A('<span style="color:' + C.p + '">harry@huy.gg</span> <span style="color:' + C.mut + '">~/carbon</span> <span style="color:' + C.cmd + '">$ ' + safe + '</span>');
      const key = cmd.replace(/^codemap\s+/i, '').trim();
      const fn = CMD[key] || CMD[key.toLowerCase()];
      if (fn) fn(); else { A('<span style="color:' + C.mut + '">no such command: ' + safe + '</span>'); A('<span style="color:' + C.mut + '">try </span><span style="color:' + C.acc + '">help</span>'); }
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const v = input.textContent; input.textContent = ''; run(v); } });
    const body = document.getElementById('cm-body');
    body.addEventListener('click', (e) => { if (e.target !== input) input.focus(); });
  }

function serverTerminal() {
    const feed = document.getElementById('log-feed');
    if (!feed) return;
    const C = { p: 'var(--sumi2)', cmd: 'var(--sumi1)', ok: '#276B2B', acc: 'var(--sumi)', mut: '#635C51', txt: '#3B352D' };

    const pool = [
      ['cloudflare', 'GET /resume → 200 OK'], ['nginx', 'cache HIT • 12ms'],
      ['wireguard', 'peer connected (peer_03)'], ['pihole', 'blocked googleads.g.doubleclick.net'],
      ['pihole', 'blocked 47 trackers in last 60s'], ['jellyfin', 'streaming 1080p'],
      ['owncloud', 'sync complete (47 files, 312 MB)'], ['cloudflare', 'email forwarded h@huy.gg → gmail'],
      ['nginx', 'TLS handshake • TLS_AES_256_GCM'], ['mariadb', 'query took 3ms'],
      ['huy.gg', 'visitor from Denver, CO'], ['cloudflare', 'GET /projects → 200 OK'],
      ['wireguard', 'rx 1.2 GB • tx 412 MB'], ['pihole', '24.7% queries blocked today']
    ];
    const pad = (n) => n < 10 ? '0' + n : '' + n;
    const ts = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
    const addLog = () => {
      if (!document.body.contains(feed)) return;
      const pp = pool[Math.floor(Math.random() * pool.length)];
      const div = document.createElement('div');
      div.style.cssText = 'opacity:0;animation:tfade .25s ease forwards;';
      div.innerHTML = '<span style="color:' + C.mut + '">[' + ts() + ']</span> <span style="color:' + C.ok + '">' + pp[0] + '</span> <span style="color:' + C.mut + '">→</span> <span style="color:' + C.txt + '">' + pp[1] + '</span>';
      feed.appendChild(div);
      while (feed.children.length > 5) feed.removeChild(feed.firstChild);
      setTimeout(addLog, 1400 + Math.random() * 2200);
    };
    setTimeout(addLog, 300);

    const input = document.getElementById('term-input');
    const history = document.getElementById('term-history');
    const A = (html) => { const d = document.createElement('div'); d.style.cssText = 'opacity:0;animation:tfade .25s ease forwards;'; d.innerHTML = html; history.appendChild(d); };
    const CMD = {
      help: () => { A('<span style="color:' + C.mut + '">available: </span><span style="color:' + C.acc + '">whoami • ls services • cat motd • ping huy.gg • uptime • clear</span>'); },
      whoami: () => A('<span style="color:' + C.ok + '">harry</span> <span style="color:' + C.mut + '">• builder, runner, and occasional breaker of things</span>'),
      'ls services': () => { ['huy.gg :: static site, fronted by Cloudflare', 'wireguard :: personal VPN, peer access only', 'pihole :: DNS sinkhole, network-wide ad/tracker block', 'owncloud :: self-hosted file sync', 'jellyfin :: media server', 'email :: Cloudflare routing → Gmail (h@huy.gg)'].forEach((s) => { const p = s.split(' :: '); A('<span style="color:' + C.acc + '">' + p[0] + '</span> <span style="color:' + C.mut + '">• ' + p[1] + '</span>'); }); },
      'cat motd': () => { A('<span style="color:' + C.mut + '">─────────────────────────────</span>'); A('  Welcome to <span style="color:' + C.ok + '">huy.gg</span>. The lights are always on.'); A('<span style="color:' + C.mut + '">  uptime: 287 days • 14:23:07</span>'); A('<span style="color:' + C.mut + '">─────────────────────────────</span>'); },
      'ping huy.gg': () => { ['64 bytes from huy.gg: icmp_seq=1 time=0.412 ms', '64 bytes from huy.gg: icmp_seq=2 time=0.398 ms', '64 bytes from huy.gg: icmp_seq=3 time=0.421 ms', '--- huy.gg ping statistics ---', '3 packets transmitted, 3 received, 0% packet loss'].forEach((l, i) => setTimeout(() => A('<span style="color:' + C.mut + '">' + l + '</span>'), i * 200)); },
      uptime: () => A('<span style="color:' + C.ok + '">up 287 days</span>, 14:23, load average: 0.08, 0.12, 0.09'),
      clear: () => { history.innerHTML = ''; }
    };
    CMD.ls = CMD['ls services']; CMD.motd = CMD['cat motd']; CMD.ping = CMD['ping huy.gg'];
    const run = (raw) => {
      const cmd = (raw || '').trim(); if (!cmd) return;
      A('<span style="color:' + C.p + '">harry@huy.gg</span> <span style="color:' + C.mut + '">~</span> <span style="color:' + C.cmd + '">$ ' + cmd.replace(/[<>]/g, '') + '</span>');
      const fn = CMD[cmd] || CMD[cmd.toLowerCase()];
      if (fn) fn(); else { A('<span style="color:' + C.mut + '">zsh: command not found: ' + cmd.replace(/[<>]/g, '') + '</span>'); A('<span style="color:' + C.mut + '">try </span><span style="color:' + C.acc + '">help</span>'); }
    };
    if (input) {
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const v = input.textContent; input.textContent = ''; run(v); } });
      const body = document.getElementById('term-body');
      body.addEventListener('click', (e) => { if (e.target !== input) input.focus(); });
    }
  }

  if (document.getElementById('cm-input')) codemapTerminal();
  if (document.getElementById('term-input')) serverTerminal();
})();
