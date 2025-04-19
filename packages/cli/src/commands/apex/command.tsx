import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import packageJson from '@/package.json' with {type: 'json'}

import {Apex} from './action'

export const apex = new Command()
	.name('wunshot')
	.version(
		packageJson.version ?? '0.0.1',
		'-v, --version',
		'display the version number',
	)
	.action(() => {
		render(<Apex />)
	})
