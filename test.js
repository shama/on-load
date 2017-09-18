var onload = require('./')
var test = require('tape')
var yo = require('yo-yo')

test('onload/onunload', function (t) {
  t.plan(2)
  var el = document.createElement('div')
  el.textContent = 'test'
  onload(el, function () {
    t.ok(true, 'onload called')
  }, function () {
    t.ok(true, 'onunload called')
    document.body.innerHTML = ''
    t.end()
  })
  document.body.appendChild(el)
  document.body.removeChild(el)
})

test('assign key attr', function (t) {
  t.plan(1)
  var el = document.createElement('div')
  el.textContent = 'test'
  onload(el)
  t.ok(el.hasAttribute(onload.KEY_ATTR), 'has correct key attr')
})

test('passed el reference', function (t) {
  t.plan(4)
  function page1 () {
    var tree = yo`<div>page1</div>`
    return onload(tree, function (el) {
      t.equal(el, tree, 'onload passed element reference for page1')
    }, function (el) {
      t.equal(el, tree, 'onunload passed element reference for page1')
    })
  }
  function page2 () {
    var tree = yo`<div>page2</div>`
    return onload(tree, function (el) {
      t.equal(el.textContent, 'page2', 'onload passed element reference for page2')
    }, function (el) {
      t.equal(el.textContent, 'page2', 'onunload passed element reference for page2')
    })
  }

  var root = page1()
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
  var e1 = document.createElement('div')
  var e2 = document.createElement('div')
  e1.appendChild(e2)
  document.body.appendChild(e1)

  var e3 = document.createElement('div')
  onload(e3, function () {
    t.ok(true, 'onload called')
  }, function () {
    t.ok(true, 'onunload called')
    document.body.innerHTML = ''
    t.end()
  })
  e2.appendChild(e3)
  e2.removeChild(e3)
})

test('complex', function (t) {
  t.plan(3)
  var state = []

  function button () {
    var el = yo`<button>click</button>`
    onload(el, function () {
      state.push('on')
    }, function () {
      state.push('off')
    })
    return el
  }

  var root = yo`<div>
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
      var btn = button()
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
  var state = []
  function button () {
    var el = yo`<button>click</button>`
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

  var root = app(yo`<div>Loading...</div>`)
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
  var results = []
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
  var root = page1()
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
    var expected = [
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

test.skip('operates with memoized elements', function (t) {
  t.plan(1)
  var results = []
  function sub () {
    return onload(yo`<div>sub</div>`, function () {
      results.push('sub on')
    }, function () {
      results.push('sub off')
    })
  }
  var saved = null
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
  var root = app()
  document.body.appendChild(root)
  var interval = setInterval(function () {
    yo.update(root, app())
  }, 10)
  setTimeout(function () {
    clearInterval(interval)
    t.deepEqual(results, ['parent on', 'sub on'])
    t.end()
  }, 100)
})

function runops (ops, done) {
  function loop () {
    var next = ops.shift()
    if (next) {
      next()
      setTimeout(loop, 10)
    } else {
      if (done) done()
    }
  }
  setTimeout(loop, 10)
}
