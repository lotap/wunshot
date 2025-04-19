import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {Hello} from './action'

export const hello = new Command()
	.name('hello')
	.argument('[name]', 'Whom to greet')
	.description('Print "Hello, [name]!" to the console')
	.action((name) => {
		render(<Hello name={name} />)
	})
