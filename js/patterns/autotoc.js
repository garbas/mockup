/* Autotoc pattern.
 *
 * Options:
 *    IDPrefix(string): Prefix used to generate ID. ('autotoc-item-')
 *    classActiveName(string): Class used for active level. ('active')
 *    classLevelPrefixName(string): Class prefix used for the TOC levels. ('autotoc-level-')
 *    classSectionName(string): Class used for section in TOC. ('autotoc-section')
 *    classTOCName(string): Class used for the TOC. ('autotoc-nav')
 *    levels(string): Selectors used to find levels. ('h1,h2,h3')
 *    scrollDuration(string): Speed of scrolling. ('slow')
 *    scrollEasing(string): Easing to use while scrolling. ('swing')
 *    section(string): Tag type to use for TOC. ('section')
 *
 * Documentation:
 *    # Set custom levels
 *
 *    {{ example-1 }}
 *
 * Example: example-1
 *    <div class="pat-autotoc"
 *          data-pat-autotoc="scrollDuration:slow;levels:h4,h5,h6;">
 *      <h4>Title 1</h4>
 *      <p>Mr. Zuckerkorn, you've been warned about touching. You said
 *         spanking. It walked on my pillow! How about a turtle? I've always
 *         loved those leathery little snappy faces.</p>
 *      <h5>Title 1.1</h5>
 *      <p>Ah coodle doodle do Caw ca caw, caw ca caw. Butterscotch!</p>
 *      <h6>Title 1.1.1</h6>
 *      <p>Want a lick? Okay, Lindsay, are you forgetting that I was
 *         a professional twice over - an analyst and a therapist.</p>
 *      <h4>Title 2</h4>
 *      <p>You boys know how to shovel coal? Don't worry, these young
 *      beauties have been nowhere near the bananas. I thought the two of
 *      us could talk man-on-man.</p>
 *    </div>
 *
 * License:
 *    Copyright (C) 2010 Plone Foundation
 *
 *    This program is free software; you can redistribute it and/or modify it
 *    under the terms of the GNU General Public License as published by the
 *    Free Software Foundation; either version 2 of the License.
 *
 *    This program is distributed in the hope that it will be useful, but
 *    WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
 *    Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License along
 *    with this program; if not, write to the Free Software Foundation, Inc.,
 *    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


define([
  'jquery',
  'mockup-patterns-base'
], function($, Base) {
  "use strict";

  var AutoTOC = Base.extend({
    name: "autotoc",
    defaults: {
      section: 'section',
      levels: 'h1,h2,h3',
      IDPrefix: 'autotoc-item-',
      classTOCName: 'autotoc-nav',
      classSectionName: 'autotoc-section',
      classLevelPrefixName: 'autotoc-level-',
      classActiveName: 'active',
      scrollDuration: 'slow',
      scrollEasing: 'swing'
    },
    init: function() {
      var self = this;

      self.$toc = $('<nav/>').addClass(self.options.classTOCName);

      if (self.options.prependTo) {
        self.$toc.prependTo(self.options.prependTo);
      }
      else if (self.options.appendTo) {
        self.$toc.appendTo(self.options.appendTo);
      }
      else{
        self.$toc.prependTo(self.$el);
      }

      if (self.options.className) {
        self.$el.addClass(self.options.className);
      }

      $(self.options.section, self.$el).addClass(self.options.classSectionName);

      $(self.options.levels, self.$el).each(function(i) {
        var $level = $(this),
            id = $level.prop('id') ? '#' + $level.prop('id') :
                 $level.parents(self.options.section).prop('id');
        if (!id) {
          id = self.options.IDPrefix + self.name + '-' + i;
          $level.prop('id', id);
        }
        $('<a/>')
          .appendTo(self.$toc)
          .text($level.text())
          .prop('href', id)
          .addClass(self.options.classLevelPrefixName + self.getLevel($level))
          .on('click', function(e, doScroll) {
            e.stopPropagation();
            e.preventDefault();
            self.$toc.children('.' + self.options.classActiveName).removeClass(
              self.options.classActiveName);
            self.$el.children('.' + self.options.classActiveName).removeClass(
              self.options.classActiveName);
            $(e.target).addClass(self.options.classActiveName);
            $level.parents(self.options.section)
                .addClass(self.options.classActiveName);
            if (doScroll !== false && self.options.scrollDuration && $level) {
              $('body,html').animate({
                scrollTop: $level.offset().top
              }, self.options.scrollDuration, self.options.scrollEasing);
            }
            if (self.$el.parents('.modal').size() !== 0) {
              self.$el.trigger('resize.modal.patterns');
            }
            $(this).trigger('clicked');
          });
      });

      self.$toc.find('a').first().trigger('click', false);

    },
    getLevel: function($el) {
      var elementLevel = 0;
      $.each(this.options.levels.split(','), function(level, levelSelector) {
        if ($el.filter(levelSelector).size() === 1) {
          elementLevel = level + 1;
          return false;
        }
      });
      return elementLevel;
    }
  });

  return AutoTOC;

});
