import React, {useEffect, useState} from 'react'
import {Text} from 'ink'
import BigText from 'ink-big-text'

import {withActionLayout} from '@/src/components/action-layout'
import {ModuleSelect} from '@/src/components/module-select'

/**
 * @todo
 * - check for package.json
 * - check for drizzle dep
 * - check for valibot dep
 * - check for ts dep
 *
 * - check for db dir
 * - check for db/models
 * - check for db/ops
 *
 * - list core modules available to install
 */

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function Init() {
	const [done, setDone] = useState(false)

	useEffect(() => {
		setDone(true)
	}, [])

	if (!done) return <Text>INITIALIZING</Text>

	return <ModuleSelect />
}

export const InitAction = withActionLayout(() => (
	<>
		<BigText text="wunshot" font="block" />
		<Init />
	</>
))
