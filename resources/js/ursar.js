var spinner = new Spinner();
var spinnerDiv = document.getElementById('spinner');

var LinkModel = Backbone.Model.extend({
  defaults: function() {
    return {
      title: null,
      desc: null,
      url: null,
      date: null
    };
  }
});

var LinkCollection = Backbone.Collection.extend({
  model: LinkModel,
  url: 'links.json'//,

  // Should find a way to handle sort at initialization because the add event
  // is called before sorting. Maybe add all models in sync event.
  // comparator: function(link) {
  //   return -(new Date(link.get('date'))).getTime();
  // }
});

var LinkView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

var LinksView = Backbone.View.extend({
  el: "#link-list",
  wasSearching: false,
  initialize: function() {
    this.listenTo(Links, 'add', this.addOne);
    this.listenTo(Links, 'reset', this.displaySearch);
    this.listenTo(Links, 'sync', this.syncDone);
    Links.fetch();
  },

  addOne: function(linkModel) {
    if(this.wasSearching === true) {
      this.clearView();
      this.wasSearching = false;
    }

    var view = new LinkView({model: linkModel});
    // Switched append to prepend as temp sorting hack
    this.$el.prepend(view.render().el);
  },

  displaySearch: function(newModel) {
    var _this = this;

    this.clearView();
    newModel.models.forEach(function(model) {
      _this.addOne(model);
    });
    this.wasSearching = true;
  },

  clearView: function() {
    this.$el.children().remove();
    this.$el.empty();
  },

  syncDone: function() {
    spinner.stop();
  }
});

var Links = new LinkCollection();
var searching = null;

$('#search').keyup(function(ev) {
  if(searching !== null) {
    clearTimeout(searching);
  }
  var textToFind = ev.target.value;
  if(textToFind.trim().length === 0) {
    Links.fetch();
  } else {
    searching = startSearch(textToFind);
  }
});

function startSearch(word) {
  return setTimeout(function () {
    var filtered = Links.filter(function (elem) {
      var searchInTitle = elem.get('title') === null ? -1 : elem.get('title').toLowerCase().indexOf(word);
      var searchInDesc = elem.get('desc') === null ? -1 : elem.get('desc').toLowerCase().indexOf(word);
      var searchInUrl = elem.get('url') === null ? -1 : elem.get('url').toLowerCase().indexOf(word);

      return searchInTitle > -1 ||
          searchInUrl > -1 ||
          searchInDesc > -1;
    });
    Links.reset(filtered);
  }, 1000);
}

new LinksView();
spinnerDiv.appendChild(spinner.spin().el);