const onload = require('./')
const test = require('tape')
const yo = require('yo-yo')

test('onload/onunload', function (t) {
  t.plan(2)
  const el = document.createElement('div')
  el.textContent = 'test'
  onload(el, function () {
    t.ok(true, 'onload called')
    document.body.removeChild(el)
  }, function () {
    t.ok(true, 'onunload called')
    document.body.innerHTML = ''
    t.end()
  })
  document.body.appendChild(el)
})

test('assign key attr', function (t) {
  t.plan(1)
  const el = document.createElement('div')
  el.textContent = 'test'
  onload(el)
  t.ok(el.hasAttribute(onload.KEY_ATTR), 'has correct key attr')
})

test('passed el reference', function (t) {
  t.plan(4)
  function page1 () {
    const tree = yo`<div>page1</div>`
    return onload(tree, function (el) {
      t.equal(el, tree, 'onload passed element reference for page1')
    }, function (el) {
      t.equal(el, tree, 'onunload passed element reference for page1')
    })
  }
  function page2 () {
    const tree = yo`<div>page2</div>`
    return onload(tree, function (el) {
      t.equal(el.textContent, 'page2', 'onload passed element reference for page2')
    }, function (el) {
      t.equal(el.textContent, 'page2', 'onunload passed element reference for page2')
    })
  }

  let root = page1()
  document.body.appendChild(root)
  runops([
    function () {
      root = yo.update(root, page2())
    },
    function () {
      root.parentNode.removeChild(root)
    }
  ])
})

test('nested', function (t) {
  t.plan(2)
  const e1 = document.createElement('div')
  const e2 = document.createElement('div')
  e1.appendChild(e2)
  document.body.appendChild(e1)

  const e3 = document.createElement('div')
  onload(e3, function () {
    t.ok(true, 'onload called')
    e2.removeChild(e3)
  }, function () {
    t.ok(true, 'onunload called')
    document.body.innerHTML = ''
    t.end()
  })
  e2.appendChild(e3)
})

test('complex', function (t) {
  t.plan(3)
  let state = []

  function button () {
    const el = yo`<button>click</button>`
    onload(el, function () {
      state.push('on')
    }, function () {
      state.push('off')
    })
    return el
  }

  let root = yo`<div>
    ${button()}
  </div>`
  document.body.appendChild(root)

  runops([
    function () {
      t.deepEqual(state, ['on'], 'turn on')
      state = []
      root = yo.update(root, yo`<p>removed</p>`)
    },
    function () {
      t.deepEqual(state, ['off'], 'turn off')
      state = []
      const btn = button()
      root = yo.update(root, yo`<p><div>${btn}</div></p>`)
      root = yo.update(root, yo`<p>
        <div>Updated</div>
        <div>${btn}</div>
      </p>`)
    },
    function () {
      t.deepEqual(state, ['on'], 'turn on')
      root.parentNode.removeChild(root)
    }
  ], function () {
    t.end()
  })
})

test('complex nested', function (t) {
  t.plan(7)
  let state = []
  function button () {
    const el = yo`<button>click</button>`
    onload(el, function () {
      state.push('on')
    }, function () {
      state.push('off')
    })
    return el
  }
  function app (page) {
    return yo`<div class="app">
      <h1>Hello</h1>
      ${page}
    </div>`
  }

  let root = app(yo`<div>Loading...</div>`)
  document.body.appendChild(root)

  runops([
    function () {
      t.deepEqual(state, [], 'did nothing')
      state = []
      root = yo.update(root, app(yo`<div class="page">
        ${button()}
      </div>`))
    },
    function () {
      t.deepEqual(state, ['on'], 'turn on')
      state = []
      root = yo.update(root, app(yo`<div class="page">
        <h3>Another Page</h3>
      </div>`))
    },
    function () {
      t.deepEqual(state, ['off'], 'turn off')
      state = []
      root = yo.update(root, app(yo`<div class="page">
        ${button()}
        ${button()}
      </div>`))
    },
    function () {
      t.deepEqual(state, ['on', 'on'], 'turn 2 on')
      state = []
      root = yo.update(root, app(yo`<div class="page">
        ${button()}
        <p>removed</p>
      </div>`))
    },
    function () {
      t.deepEqual(state, ['off'], 'turn one off')
      state = []
      root = yo.update(root, app(yo`Loading...`))
    },
    function () {
      t.deepEqual(state, ['off'], 'turn other off')
      state = []
      root = yo.update(root, app(yo`<div>
        <ul>
          <li><div><p>${button()}</p></div></li>
        </ul>
      </div>`))
    },
    function () {
      t.deepEqual(state, ['on'], 'turn on')
      root.parentNode.removeChild(root)
    }
  ], function () {
    t.end()
  })
})

test('fire on same node but not from the same caller', function (t) {
  t.plan(1)
  const results = []
  function page1 (contents) {
    return onload(yo`<div id="choo-root">${contents}</div>`, function () {
      results.push('page1 on')
    }, function () {
      results.push('page1 off')
    })
  }
  function page2 (contents) {
    return onload(yo`<div id="choo-root">${contents}</div>`, function () {
      results.push('page2 on')
    }, function () {
      results.push('page2 off')
    })
  }
  let root = page1()
  document.body.appendChild(root)
  runops([
    function () {
      root = yo.update(root, page1())
    },
    function () {
      root = yo.update(root, page2())
    },
    function () {
      root = yo.update(root, page2())
    },
    function () {
      root = yo.update(root, page2('dont fire'))
    },
    function () {
      root = yo.update(root, page1('fire!'))
    },
    function () {
      root = yo.update(root, page1('but not now'))
    },
    function () {
      document.body.removeChild(root)
    }
  ], function () {
    const expected = [
      'page1 on',
      'page1 off',
      'page2 on',
      'page2 off',
      'page1 on',
      'page1 off'
    ]
    t.deepEqual(results, expected)
    t.end()
  })
})

test('operates with memoized elements', function (t) {
  t.plan(1)
  const results = []
  function sub () {
    return onload(yo`<div>sub</div>`, function () {
      results.push('sub on')
    }, function () {
      results.push('sub off')
    })
  }
  let saved = null
  function parent () {
    saved = saved || onload(yo`<div>parent${sub()}</div>`, function () {
      results.push('parent on')
    }, function () {
      results.push('parent off')
    })
    return saved
  }
  function app () {
    return yo`<div>${parent()}</div>`
  }
  const root = app()
  document.body.appendChild(root)
  const interval = setInterval(function () {
    yo.update(root, app())
  }, 10)
  setTimeout(function () {
    clearInterval(interval)
    t.deepEqual(results, ['parent on', 'sub on'])
    t.end()
  }, 100)
})

test('use latest callbacks from particular caller', function (t) {
  t.plan(1)
  const results = []
  function page (contents) {
    return onload(yo`<div id="choo-root">${contents}</div>`, function () {
      results.push('page on: ' + contents)
    }, function () {
      results.push('page off: ' + contents)
    })
  }
  let root = page('render1')
  document.body.appendChild(root)
  runops([
    function () {
      root = yo.update(root, page('render2'))
    },
    function () {
      root = yo.update(root, page('render3'))
    },
    function () {
      document.body.removeChild(root)
    }
  ], function () {
    const expected = [
      'page on: render1',
      'page off: render3'
    ]
    t.deepEqual(results, expected)
    t.end()
  })
})

function runops (ops, done) {
  function loop () {
    const next = ops.shift()
    if (next) {
      next()
      setTimeout(loop, 10)
    } else {
      if (done) done()
    }
  }
  setTimeout(loop, 10)
}
