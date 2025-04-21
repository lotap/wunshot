import {randomUUID, randomBytes} from 'node:crypto'
import React from 'react'
import {Text} from 'ink'

import {withActionLayout} from '@/src/components/action-layout'

export function Secret({count}: {count: number}) {
	console.log(count)
	return (
		<Text>
			{Array.from(
				{length: count},
				() => `${randomUUID()}:${randomBytes(32).toString('base64url')}`,
			).join()}
		</Text>
	)
}

export const SecretAction = withActionLayout(Secret)
