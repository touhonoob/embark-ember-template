import Ember from 'ember'

export default Ember.Component.extend({
  repo: Ember.inject.service(),
  tagName: 'li',
  editing: false,
  classNameBindings: ['todo.completed', 'editing'],

  actions: {
    startEditing() {
      this.onStartEdit();
      this.set('editing', true);
      Ember.scheduleOnce('afterRender', this, 'focusInput');
    },

    doneEditing(todoTitle) {
      if (!this.editing) { return; }
      if (Ember.isBlank(todoTitle)) {
        this.send('removeTodo');
      } else {
        this.set('todo.title', todoTitle.trim());
        this.set('editing', false);
        this.onEndEdit();
      }
    },

    handleKeydown(e) {
      if (e.keyCode === 13) {
        e.target.blur();
      } else if (e.keyCode === 27) {
        this.set('editing', false);
      }
    },

    toggleCompleted(e) {
      let todo = this.todo;
      Ember.set(todo, 'completed', e.target.checked);
      this.repo.persist();
    },

    removeTodo() {
      this.repo.delete(this.todo);
    }
  },

  focusInput() {
    this.element.querySelector('input.edit').focus();
  }
});
