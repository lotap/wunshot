import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {NewAction} from './action'

import {joinCommand} from '@/src/commands/join/command'
import {modelCommand} from '@/src/commands/model/command'
import {opCommand} from '@/src/commands/op/command'
import {secretCommand} from '@/src/commands/secret/command'

export const newCommand = new Command()
	.name('new')
	.description('generate scaffolding in your project')
	.addCommand(joinCommand)
	.addCommand(modelCommand)
	.addCommand(opCommand)
	.addCommand(secretCommand)
	.action(() => {
		render(<NewAction />)
	})
