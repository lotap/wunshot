import React from 'react'
import {Text} from 'ink'

import {withActionLayout} from '@/src/components/action-layout'

export function Join({names}: {names: string[]}) {
	return (
		<Text>
			GENERATE JOIN SCAFFOLD FOR: {names.map((name) => name).join(', ')}
		</Text>
	)
}

export const JoinAction = withActionLayout(Join)
