const electron = require('electron');
exports.middleware = (store) => (next) => (action) => {
	if ('SESSION_ADD_DATA' === action.type) {
		const { data } = action;
		if (/(change-cursor-color: command not found)|(command not found: change-cursor-color)/.test(data)) {
			store.dispatch({
				type: 'CHANGE_CURSOR_COLOR'
			});
		} else {
			next(action);
		}
	} else {
		next(action);
	}
};

exports.reduceUI = (state, action) => {
	switch (action.type) {
		case 'CHANGE_CURSOR_COLOR':
			return state.set('customCursorColor', !state.customCursorColor);
	}
	return state;
};

exports.mapTermsState = (state, map) => {
	return Object.assign(map, {
		wowMode: state.ui.customCursorColor
	});
};

const passProps = (uid, parentProps, props) => {
	return Object.assign(props, {
		wowMode: parentProps.customCursorColor
	});
}

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

exports.decorateTerm = (Term, { React, notify }) => {
	return class extends React.Component {
		constructor (props, context) {
			super(props, context);
			this._onTerminal = this._onTerminal.bind(this);
			this._cursor = null;
		}

		_onTerminal (term) {
			if (this.props.onTerminal) this.props.onTerminal(term);
			this._cursor = term.cursorNode_;
		}

		componentWillReceiveProps (next) {
			if (next.customCursorColor && !this.props.customCursorColor) {
				this._cursor.style.background = 'rgba(255, 0, 0, 1)';
			} else if (!next.customCursorColor && this.props.customCursorColor) {
				this._cursor.style.background = window.config.getConfig().cursorColor;
			}
		}

		render () {
			return React.createElement(Term, Object.assign({}, this.props, {
				onTerminal: this._onTerminal
			}));
		}

	}
};
