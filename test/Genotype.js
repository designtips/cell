const assert = require('assert')
const sinon = require('sinon')
const stringify = require('json-stable-stringify')
const {Genotype, Nucleus} = require("../cell")
const spy = require("./spy.js")
const compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
}
describe("Genotype", function(){
  require('jsdom-global')()
  describe("indenpendent from set", function(){
    describe("update", function(){
      it("calls Genotype.set and Nuclues queue", function(){
        const $node = document.createElement("div")
        $node.Genotype = {}
        $node.Meta = {}
        Nucleus._queue = []

        spy.Genotype.set.reset();
        Genotype.update($node, "class", "red")

        // After
        // Nucleus.queue.length > 0
        compare(Nucleus._queue.length, 1)
        // Genotype.set called
        compare(spy.Genotype.set.callCount, 1)
      })
    })
    describe("build", function(){
      it("if $node.Meta.prokaryotic, do nothing", function(){
        const $node = document.createElement("div")
        $node.Meta = {
          prokaryotic: true
        }
        spy.Genotype.set.reset()

        Genotype.build($node, {}, null)
        compare(spy.Genotype.set.callCount, 0)
      })
      it("Genotype.set called multiple times for each key", function(){
        const $node = document.createElement("div")
        $node.Genotype = {}
        $node.Meta = {}

        spy.Genotype.set.reset()

        Genotype.build($node, {$type: "div", class: "red", fun: function() { }})
        compare(spy.Genotype.set.callCount, 3)
      })
    })
    describe("set", function(){
      describe("Function binding (Nucleus.bind)", function(){
        it("$init doesn't run Nucleus.bind", function(){
          // Nucleus.bind makes sure that $update() is run after the function is executed.
          // In case of $init() we don't want this behavior because $init() will take care of it
          // on its own
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}

          spy.Nucleus.bind.reset()

          Genotype.set($node, "$init", function(){
            // blah blah
          })
          compare(spy.Nucleus.bind.callCount, 0);
        })
        it("other functions run Nucleus.bind", function(){
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}

          spy.Nucleus.bind.reset()

          Genotype.set($node, "_fun", function(){
            // blah blah 
          })
          compare(spy.Nucleus.bind.callCount, 1);
        })
      })
      describe("non collection", function(){
        it("calls Nucleus.bind", function(){
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}

          spy.Nucleus.bind.reset()

          Genotype.set($node, "$type", "div")

          compare(spy.Nucleus.bind.callCount, 1)
        })
      })
    })
  })
  describe("AFTER set", function(){
    var $node;
    beforeEach(function(){
      $node = document.createElement("div")
      $node.Genotype = {}
      $node.Meta = {}
      spy.Nucleus.bind.reset()
      spy.Nucleus.queue.reset()
      Genotype.set($node, "$components", [{
        class: "red"
      }, {
        class: "green"
      }, {
        class: "blue"
      }])
      Genotype.set($node, "keys", {
        a: "A",
        b: "B",
        c: "C"
      })
    })
    afterEach(function(){
      spy.Nucleus.bind.reset()
      spy.Nucleus.queue.reset()
      Nucleus._queue = []
    })
    it("setting a diffrent attribute on the node has nothing to do with this", function(){
      Genotype.set($node, "$type", "p")
      compare(spy.Nucleus.queue.callCount, 0)
    })
    it("if the value is the same, don't call Nucleus.queue (object)", function(){
      $node.Genotype.$components[0] = {class: "red"}
      compare(spy.Nucleus.queue.callCount, 0)
    })
    it("if the value is the same, don't call Nucleus.queue (array)", function(){
      $node.Genotype.keys.b = "B";
      compare(spy.Nucleus.queue.callCount, 0)
      compare($node.Genotype.keys, {
        a: "A",
        b: "B",
        c: "C"
      })
    })
  })
})
