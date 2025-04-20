import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {AddAction} from './action'

export const addCommand = new Command()
	.name('add')
	.description('add modules to your project')
	.argument('[modules...]', 'the module(s) to add')
	.action((modules) => {
		render(<AddAction modules={modules} />)
	})
