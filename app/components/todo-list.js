import Ember from 'ember'

export default Ember.Component.extend({
    repo: Ember.inject.service(),
    tagName: 'section',
    classNames: ['main'],
    canToggle: true,
    allCompleted: Ember.computed('todos.@each.completed', function () {
        return this.todos.isEvery('completed');
    }),

    actions: {
        enableToggle() {
            this.set('canToggle', true);
        },

        disableToggle() {
            this.set('canToggle', false);
        },

        toggleAll() {
            let allCompleted = this.allCompleted;
            this.todos.forEach(todo => Ember.set(todo, 'completed', !allCompleted));
            this.repo.persist();
        }
    }
});