import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {NewAction} from './action'

import {modelCommand} from '@/src/commands/model/command'

export const newCommand = new Command()
	.name('new')
	.description('generate scaffolding in your project')
	.addCommand(modelCommand)
	.action(() => {
		render(<NewAction />)
	})
