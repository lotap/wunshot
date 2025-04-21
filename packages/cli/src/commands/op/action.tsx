import React from 'react'
import {Text} from 'ink'

import {withActionLayout} from '@/src/components/action-layout'

export function Op({names}: {names: string[]}) {
	return (
		<Text>GENERATE SCAFFOLD FOR: {names.map((name) => name).join(', ')}</Text>
	)
}

export const OpAction = withActionLayout(Op)
