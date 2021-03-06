define([
  'expect',
  'jquery',
  'mockup-registry',
  'mockup-patterns-backdrop'
], function(expect, $, registry, Backdrop) {
  "use strict";

  window.mocha.setup('bdd');
  $.fx.off = true;

  /* ==========================
   TEST: Backdrop
  ========================== */

  describe("Backdrop", function() {
    it("default behaviour", function() {
      var $el = $('<div></div>'),
          backdrop = new Backdrop($el);
      expect($('.backdrop', $el).size()).to.equal(1);
      expect($el.hasClass('backdrop-active')).to.equal(false);
      backdrop.show();
      expect($el.hasClass('backdrop-active')).to.equal(true);
      backdrop.hide();
      expect($el.hasClass('backdrop-active')).to.equal(false);
      backdrop.show();
      expect($el.hasClass('backdrop-active')).to.equal(true);
      backdrop.$backdrop.trigger('click');
      expect($el.hasClass('backdrop-active')).to.equal(false);
      backdrop.show();
      expect($el.hasClass('backdrop-active')).to.equal(true);
      var keydown = $.Event("keydown");
      keydown.keyCode = 50;
      $(document).trigger(keydown);
      expect($el.hasClass('backdrop-active')).to.equal(true);
      keydown.keyCode = 27;
      $(document).trigger(keydown);
      expect($el.hasClass('backdrop-active')).to.equal(false);
    });
  });

});
