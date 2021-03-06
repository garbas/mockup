// Author: Nathan Van Gheem
// Contact: nathan@vangheem.us
// Version: 1.0
//
// Description:
//
// License:
//
// Copyright (C) 2010 Plone Foundation
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program; if not, write to the Free Software Foundation, Inc., 51
// Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//


define([
  'jquery',
  'underscore',
  'backbone',
  'text!js/patterns/structure/templates/tablerow.xml',
  'bootstrap-dropdown'
], function($, _, Backbone, TableRowTemplate) {
  "use strict";

  var TableRowView = Backbone.View.extend({
    tagName: 'tr',
    className: 'itemRow',
    template: _.template(TableRowTemplate),
    events: {
      'change input': 'itemSelected',
      'click td.title a': 'itemClicked',
      'click .cutItem a': 'cutClicked',
      'click .copyItem a': 'copyClicked',
      'click .pasteItem a': 'pasteClicked',
      'click .move-top a': 'moveTopClicked',
      'click .move-bottom a': 'moveBottomClicked',
      'click .set-default-page a': 'setDefaultPageClicked',
      'click .openItem a': 'openClicked',
      'click .editItem a': 'editClicked'
    },
    initialize: function(options){
      this.options = options;
      this.app = options.app;
      this.selectedCollection = this.app.selectedCollection;
      this.table = this.options.table;
    },
    render: function() {
      var self = this;
      var data = this.model.toJSON();
      data.selected = false;
      if(this.selectedCollection.findWhere({UID: data.UID})){
        data.selected = true;
      }
      data.attributes = self.model.attributes;
      data.activeColumns = self.app.activeColumns;
      data.availableColumns = self.app.availableColumns;
      data.pasteAllowed = self.app.pasteAllowed;
      data.canSetDefaultPage = self.app.setDefaultPageUrl;
      data.inQueryMode = self.app.inQueryMode();
      self.$el.html(self.template(data));
      var attrs = self.model.attributes;
      self.$el.addClass('state-' + attrs.review_state).
        addClass('type-' + attrs.Type);
      if(attrs.is_folderish){
        self.$el.addClass('folder');
      }
      self.$el.attr('data-path', data.path);
      self.$el.attr('data-UID', data.UID);
      self.$el.attr('data-id', data.id);
      self.$el.attr('data-type', data.Type);
      self.$el.attr('data-folderish', data.is_folderish);
      self.el.model = this.model;

      self.$dropdown = self.$('.dropdown-toggle');
      self.$dropdown.dropdown();

      return this;
    },
    itemClicked: function(e){
      e.preventDefault();
      /* check if this should just be opened in new window */
      var keyEvent = this.app.keyEvent;
      if(keyEvent && keyEvent.ctrlKey){
        this.openClicked(e);
      }else if(this.model.attributes.is_folderish){
        // it's a folder, go down path and show in contents window.
        this.app.queryHelper.currentPath = this.model.attributes.path;
        // also switch to fix page in batch
        var collection = this.app.collection;
        collection.goTo(collection.information.firstPage);
      }else{
        this.openClicked(e);
      }
    },
    itemSelected: function(){
      var checkbox = this.$('input')[0];
      if(checkbox.checked){
        this.app.selectedCollection.add(this.model);
      }else{
        this.app.selectedCollection.removeResult(this.model);
      }

      var selectedCollection = this.selectedCollection;

      /* check for shift click now */
      var keyEvent = this.app.keyEvent;
      if(keyEvent && keyEvent.shiftKey && this.app.last_selected &&
            this.app.last_selected.parentNode !== null){
        var $el = $(this.app.last_selected);
        var last_checked_index = $el.index();
        var this_index = this.$el.index();
        this.app.tableView.$('input[type="checkbox"]').each(function(){
          $el = $(this);
          var index = $el.parents('tr').index();
          if((index > last_checked_index && index < this_index) ||
              (index < last_checked_index && index > this_index)){
            this.checked = checkbox.checked;
            var model = $(this).closest('tr')[0].model;
            var existing = selectedCollection.getByUID(model.attributes.UID);
            if(this.checked){
              if(!existing){
                selectedCollection.add(model);
              }
            } else if(existing){
              selectedCollection.remove(existing);
            }
          }
        });

      }
      this.app.last_selected = this.el;
    },
    cutClicked: function(e){
      e.preventDefault();
      this.cutCopyClicked('cut');
      this.app.collection.pager(); // reload to be able to now show paste button
    },
    copyClicked: function(e){
      e.preventDefault();
      this.cutCopyClicked('copy');
      this.app.collection.pager(); // reload to be able to now show paste button
    },
    cutCopyClicked: function(operation){
      var self = this;
      self.app.pasteOperation = operation;

      self.app.pasteSelection = new Backbone.Collection();
      self.app.pasteSelection.add(this.model);
      self.app.setStatus(operation + ' 1 item');
      self.app.pasteAllowed = true;
      self.app.buttons.primary.get('paste').enable();
    },
    pasteClicked: function(e){
      e.preventDefault();
      this.app.pasteEvent(this.app.buttons.primary.get('paste'), e, {
        folder: this.model.attributes.path
      });
      this.app.collection.pager(); // reload to be able to now show paste button
    },
    moveTopClicked: function(e){
      e.preventDefault();
      this.app.moveItem(this.model.attributes.id, 'top');
    },
    moveBottomClicked: function(e){
      e.preventDefault();
      this.app.moveItem(this.model.attributes.id, 'bottom');
    },
    setDefaultPageClicked: function(e){
      e.preventDefault();
      var self = this;
      $.ajax({
        url: self.app.getAjaxUrl(self.app.setDefaultPageUrl),
        type: 'POST',
        data: {
          '_authenticator': $('[name="_authenticator"]').val(),
          'id': this.$active.attr('data-id')
        },
        success: function(data){
          self.app.ajaxSuccessResponse.apply(self.app, [data]);
        },
        error: function(data){
          self.app.ajaxErrorResponse.apply(self.app, [data]);
        }
      });
    },
    getSelectedBaseUrl: function(){
      var self = this;
      return self.model.attributes.getURL;
    },
    getWindow: function(){
      var win = window;
      if (win.parent !== window) {
        win = win.parent;
      }
      return win;
    },
    openUrl: function(url){
      var self = this;
      var win = self.getWindow();
      var keyEvent = this.app.keyEvent;
      if(keyEvent && keyEvent.ctrlKey){
        win.open(url);
      }else{
        win.location = url;
      }
    },
    openClicked: function(e){
      e.preventDefault();
      var self = this;
      self.openUrl(self.getSelectedBaseUrl() + '/view');
    },
    editClicked: function(e){
      e.preventDefault();
      var self = this;
      self.openUrl(self.getSelectedBaseUrl() + '/edit');
    }
  });

  return TableRowView;
});
