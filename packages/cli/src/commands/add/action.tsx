import React from 'react'

import {Text} from 'ink'

import {withActionLayout} from '@/src/components/action-layout'
import {ModuleSelect} from '@/src/components/module-select'

export function Add({modules}: {modules: string[]}) {
	if (modules.length)
		return modules.map((module) => <Text key={module}>Adding {module}</Text>)

	return <ModuleSelect />
}

export const AddAction = withActionLayout(Add)
