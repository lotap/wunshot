import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {InitAction} from './action'

export const initCommand = new Command()
	.name('init')
	.description('initialize dependencies for a new project')
	.action(() => {
		render(<InitAction />)
	})
