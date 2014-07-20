
/**
   LinkCell renders an HTML `<a>` anchor and accepts Url and Name as user input values.

   @class Backgrid.Extension.LinkCell
   @extends Backgrid.Cell
*/
var LinkCell = Backgrid.Extension.LinkCell = Backgrid.Cell.extend({
	className: 'link-cell',
	render: function () {
		this.$el.empty();
		var formattedUrl = this.formatter.fromRaw(this.model.get(this.column.get("url")));
		var formattedName = this.formatter.fromRaw(this.model.get(this.column.get("name")));
		this.$el.append($("<a>", {
			href: formattedUrl,
			target: "_blank"
		}).text(formattedName));
		this.delegateEvents();
		return this;
	}
});
