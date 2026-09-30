import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput } from './parse.js'
import { daysFromToday, nextWeekday, shift, todayISO } from './dates.js'

const LISTS = [
  { id: 'inbox', name: 'Inbox' },
  { id: 'work', name: 'Work' },
  { id: 'home', name: 'Home' },
]

test('pulls date, priority and list out of one line', () => {
  const r = parseInput('Email Sam tomorrow !1 #work', LISTS)
  assert.equal(r.title, 'Email Sam')
  assert.equal(r.due, shift(1))
  assert.equal(r.priority, 1)
  assert.equal(r.list, 'work')
})

test('a weekday name resolves to its next occurrence', () => {
  const r = parseInput('Pay rent on friday', LISTS)
  assert.equal(r.title, 'Pay rent')
  assert.equal(r.due, nextWeekday(5))
  assert.ok(daysFromToday(r.due) > 0 && daysFromToday(r.due) <= 7)
})

test('relative phrases', () => {
  assert.equal(parseInput('Plan trip next week', LISTS).due, shift(7))
  assert.equal(parseInput('Water plants in 3 days', LISTS).due, shift(3))
  assert.equal(parseInput('Buy milk today', LISTS).due, todayISO())
})

test('a plain task keeps its whole title and gets no date', () => {
  const r = parseInput('Call mum', LISTS)
  assert.equal(r.title, 'Call mum')
  assert.equal(r.due, null)
  assert.equal(r.priority, 0)
  assert.equal(r.list, null)
})

test('an unknown #tag is dropped rather than creating a list', () => {
  const r = parseInput('Fix sink #garage', LISTS)
  assert.equal(r.list, null)
  assert.equal(r.title, 'Fix sink')
})

test('today is day zero and yesterday is negative', () => {
  assert.equal(daysFromToday(todayISO()), 0)
  assert.equal(daysFromToday(shift(-1)), -1)
})
