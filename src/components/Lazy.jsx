import React from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'

import { addElement, removeElement } from '../lib/viewport'
import { propsWithNoScriptRender } from '../lib/wrap'

class Lazy extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = { loadedAt: null }

        this.onViewport = this.onViewport.bind(this)
    }

    componentDidMount() {
        this.options = {
            callback: this.onViewport,
            cushion: this.props.cushion,
            element: findDOMNode(this),
        }
        addElement(this.options)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.cushion !== this.props.cushion) {
            this.options.cushion = nextProps.cushion
        }
    }

    componentWillUnmount() {
        removeElement(this.options)
        delete this.options
    }

    onViewport() {
        const { onLoad, onViewport, visible } = this.props

        if (!visible) {
            return false
        }

        if (onViewport) {
            onViewport()
        }

        this.setState({ loadedAt: Date.now() }, onLoad)
    }

    render() {
        const { children, component, cushion, ltIE9, visible, onLoad, onViewport, ...props } = this.props

        if (visible && this.state.loadedAt) {
            return React.createElement(component, props, children)
        }

        // wrap all contents inside noscript
        return React.createElement(component, propsWithNoScriptRender(children, ltIE9, props))
    }
}

Lazy.defaultProps = {
    component: 'div',
    cushion: 0,
    ltIE9: false,
    visible: true,
}

Lazy.propTypes = {
    children: PropTypes.node,
    component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.func,
    ]),
    cushion: PropTypes.number,
    ltIE9: PropTypes.bool,
    onLoad: PropTypes.func,
    onViewport: PropTypes.func,
    visible: PropTypes.bool,
}

export default Lazy
