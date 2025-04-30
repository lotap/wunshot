import React, {useEffect, useState} from 'react'
import {Text} from 'ink'

import packageJson from '@/package.json' with {type: 'json'}

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

const asciiW = `
___       ___       ___
\\\\\\\\     /  /\\     /  /\\
 \\\\\\\\   /  //\\\\   /  ///
  \\\\\\\\ /  ///\\\\\\ /  ///
   \\\\\\/  /// \\\\\\/  ///
    \\/__///   \\/__///
     \\__\\/     \\__\\/
`

export const InitAction = withActionLayout(() => (
	<>
		<Text>{asciiW}</Text>
		<Text>wunshot</Text>
		<Text>{`${packageJson.version}\n`}</Text>

		<Init />
	</>
))
