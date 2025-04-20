import React from 'react'
import {Text} from 'ink'

import {withActionLayout} from '@/src/components/action-layout'

export function Model({names}: {names: string[]}) {
	return (
		<Text>GENERATE SCAFFOLD FOR: {names.map((name) => name).join(', ')}</Text>
	)
}

export const ModelAction = withActionLayout(Model)
